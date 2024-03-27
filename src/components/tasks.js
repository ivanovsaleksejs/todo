import { Element }   from '../element.js'
import { form, formRow } from './form.js'
import { randomUUID } from '../functions.js'
import { readData, saveData } from '../storage.js'
import TaskLegend from './tasklegend.js'
import Popup from './popup.js'
import state     from '../state.js'

class Tasks extends Element
{
  bindings = {
    list: {
      set: val => {
        this.storeTaskList(val)
        state.todo.children.todoblocks.redraw()
      },
      get: _ => {
        const projectList = state.todo.children.project.children.selector.list
        const activeTasks = state.todo.children.tasks.activeTasks
        const list = Object.entries(this.fetchTaskList())
          .map(([id, task]) => [id, ({
            ...task,
            color: projectList[task.project].color,
            repo: projectList[task.project].repo ?? null,
            active: activeTasks[task.project] ? activeTasks[task.project] == id : false
          })])
        return Object.fromEntries(list)
      }
    },
    activeTasks: {
      set: val => {
        this.storeActiveTasks(val)
        state.todo.children.todoblocks.redraw()
      },
      get: _ => this.fetchActiveTasks()
    }
  }

  fetchTaskList = _ => readData("tasks", {})

  storeTaskList = list => saveData("tasks", list)

  fetchActiveTasks = _ => readData("activeTasks", {})

  storeActiveTasks = task => saveData("activeTasks", task)

  getTaskById = id => this.list[id]

  getTasksByProject = (project = null, list = null, workspace = null) =>
    Object.entries(this.list)
      .filter(t =>
        (!project || t[1].project == project)
        &&
        (!workspace || state.todo.children.project.getProject(t[1].project).workspace == workspace)
        &&
        (!list || t[1].todoList == list)
      )
      .sort((t1, t2) => parseInt(t2[1].project ?? 0, 16) - parseInt(t1[1].project ?? 0, 16))
      .sort((t1, t2) => (t2[1].active ?? false) - (t1[1].active ?? false))
      .sort((t1, t2) => (t1[1].closed ?? false) - (t2[1].closed ?? false))

  addTaskForm = (list, id, task) =>
    form("Add new task",
      {
        taskName: formRow("Task name", {
          name: "input",
          props: {
            name: "taskname",
            value: task ? task.name : ""
          }
        }),
        taskProject: formRow("Project", {
          name: "select",
          props: { name: "project" },
          preRender: {
            getChildren: obj => {
              const project = state.todo.children.project
              const workspace = state.todo.children.workspace
              obj.children = project.getProjectOptions(
                project.fetchProjectList(),
                task ? null : workspace.fetchActiveWorkspace(),
                task ? task.project : project.fetchActiveProject()
              )
            }
          }
        }),
        taskDescription: formRow("Description", {
          name: "textarea",
          props: {
            name: "taskdescription",
            innerText: task ? task.description : ""
          }
        }),
        taskList: {
          name: "input",
          props: { name: "list", type: "hidden", value: list }
        },
        taskId: { name: "input", props: { type: "hidden", name: "id", value: task ? id : "" } },
        taskCode: { name: "input", props: { type: "hidden", name: "code", value: task ? task.code : "" } },
        submit: { name: "input", props: { type: "submit" } }
      },
      {
        listeners: {
          submit: this.saveTaskEvent
        }
      }
    )

  saveTaskEvent = e =>
  {
    e.preventDefault()

    const formdata = new FormData(e.target)
    const taskName = formdata.get("taskname")
    const projectId = formdata.get("project")
    const project = state.todo.children.project.getProject(projectId)
    const projectTasks = this.getTasksByProject(projectId)
    const description = formdata.get("taskdescription")
    const todoList = formdata.get("list")
    const taskId = formdata.get("id")
    const taskCode = formdata.get("code")

    const code = taskCode ? taskCode : `${project.code}-${projectTasks.length ? (Math.max(...(projectTasks.map(t => +t[1].code.split("-")[1])))+1) : 1}`
    this.saveTask(taskId ? taskId : randomUUID(), taskName, projectId, description, todoList, code)
    state.popup.close()
  }

  saveTask = (id, name, project, description, todoList, code) =>
  {
    const list = state.todo.children.tasks.list
    list[id] = {
      name,
      project,
      description,
      todoList,
      code
    }
    state.todo.children.tasks.list = list
  }

  deleteTaskForm = (id, task) =>
    ({
      header: { props: { innerText: "Delete this task? Cannot be undone!" } },
      info: {
        props: { className: "preview" },
        children: {
          taskLegend: new TaskLegend([id, task]),
        }
      },
      buttons: {
        children: {
          ok: {
            props: { innerText: "OK", className: "danger" },
            listeners: {
              click: _ => this.deleteTask(id)
            }
          },
          cancel: {
            props: { innerText: "Cancel" },
            listeners: {
              click: _ => state.popup.close()
            }
          }
        }
      }
    })

  deleteTask = id =>
  {
    const list = this.list
    delete list[id]
    this.list = list
    state.popup.close()
  }
}

export default Tasks
