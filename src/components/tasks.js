import { fetchActiveWorkspace } from './workspace.js'
import { getProjectList, fetchProjectList, fetchActiveProject, getProject } from './projects.js'
import { redrawBlocks } from './todoblock.js'
import { form, formRow } from './form.js'
import { randomUUID } from '../functions.js'
import { readData, saveData } from '../storage.js'
import showPopup from './popup.js'
import state     from '../state.js'

const fetchTaskList = _ => readData("tasks", {})

const storeTaskList = list => saveData("tasks", list)

const getTasksByProject = (project = null, list = null, workspace = null) =>
  Object
    .entries(fetchTaskList())
    .filter(t =>
      (!project || t[1].project == project)
        &&
      (!workspace || getProject(t[1].project).workspace == workspace)
        &&
      (!list || t[1].todoList == list)
    )

const getTasksByList = list => Object.entries(fetchTaskList()).filter(t => t[1].todoList == list)

const saveTaskEvent = e =>
{
  e.preventDefault()
  const formdata = new FormData(e.target)
  const taskName = formdata.get("taskname")
  const projectId = formdata.get("project")
  const project = getProject(projectId)
  const description = formdata.get("taskdescription")
  const todoList = "planned"
  const projectTasks = getTasksByProject(projectId)
  const code = `${project.code}-${projectTasks.length ? (Math.max(...(projectTasks.map(t => +t[1].code.split('-')[1])))+1) : 1}`
  saveTask(taskName, projectId, description, todoList, code)
  state.popup.close()
}

const saveTask = (taskName, project, description, todoList, code) =>
{
  const list = state.todo.tasks.list
  list[randomUUID()] = { name: taskName, project: project, description: description, todoList: todoList, code: code }
  state.todo.tasks.list = list
}

const addTaskForm = _ => form("Add new task",
  {
    taskName: formRow("Task name", { name: "input", props: { name: "taskname" } }),
    taskProject: formRow("Project", {
      name: "select",
      props: { name: "project" },
      children: getProjectList(fetchProjectList(), fetchActiveWorkspace(), fetchActiveProject())
    }),
    taskDescription: formRow("Description", { name: "textarea", props: { name: "taskdescription" } }),
    submit: { name: "input", props: { type: "submit" } }
  },
  {
    listeners: {
      submit: saveTaskEvent
    }
  }
)

const bindTaskList = {
  set: val => {
    storeTaskList(val)
    redrawBlocks()
  },
  get: fetchTaskList
}

const tasks = _ =>
({
  bindings: { list: bindTaskList }
})

const closeTask = id => e => {
  console.log(id, e.target.checked)
}

const taskView = (id, task) =>
({
  taskview: {
    children: {
      taskname: { props: { innerText: task.name } },
      description: { props: { innerText: task.description } },
      done: formRow("Completed", {
        name: "input",
        props: { name: "done", type: "checkbox" },
        listeners: { click: closeTask(id) }
      })
    }
  }
})

const taskLegend = ([id, task]) =>
({
  name: "tasklegend",
  props: {
    style: { backgroundColor: getProject(task.project).color },
    innerText: task.code,
    draggable: true
  },
  children: {
    info: {},
    tooltip: { props: { innerText: task.name } }
  },
  listeners: {
    dragstart: e => {
      state.todo.todoblocks.node.classList.add('dragging')
      e.dataTransfer.setData("task", id)
    },
    click: e => {
      showPopup(taskView(id, task))
    }
  }
})

export { addTaskForm, tasks, getTasksByProject, taskLegend }
