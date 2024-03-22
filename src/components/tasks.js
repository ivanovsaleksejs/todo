import { Element }   from '../element.js'
import { form, formRow } from './form.js'
import { randomUUID } from '../functions.js'
import { readData, saveData } from '../storage.js'
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
      get: _ => this.fetchTaskList()
    }
  }

  fetchTaskList = _ => readData("tasks", {})

  storeTaskList = list => saveData("tasks", list)

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
      .sort((t1, t2) => (t1[1].closed ?? false) - (t2[1].closed ?? false))

  addTaskForm = list => form("Add new task",
    {
      taskName: formRow("Task name", { name: "input", props: { name: "taskname" } }),
      taskProject: formRow("Project", {
        name: "select",
        props: { name: "project" },
        preRender: {
          getChildren: obj => {
            const project = state.todo.children.project
            const workspace = state.todo.children.workspace
            obj.children = project.getProjectOptions(project.fetchProjectList(), workspace.fetchActiveWorkspace(), project.fetchActiveProject())
          }
        }
      }),
      taskDescription: formRow("Description", { name: "textarea", props: { name: "taskdescription" } }),
      taskList: {
        name: "input",
        props: { name: "list", type: "hidden", value: list }
      },
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
    const description = formdata.get("taskdescription")
    const todoList = formdata.get("list")
    const projectTasks = this.getTasksByProject(projectId)
    const code = `${project.code}-${projectTasks.length ? (Math.max(...(projectTasks.map(t => +t[1].code.split('-')[1])))+1) : 1}`
    this.saveTask(taskName, projectId, description, todoList, code)
    state.popup.close()
  }

  saveTask = (taskName, project, description, todoList, code) =>
  {
    const list = state.todo.children.tasks.list
    list[randomUUID()] = {
      name: taskName,
      project: project,
      description: description,
      todoList: todoList,
      code: code
    }
    state.todo.children.tasks.list = list
  }
}

export default Tasks
