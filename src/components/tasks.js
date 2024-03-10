import { fetchActiveWorkspace } from './workspace.js'
import { getProjectList, fetchProjectList, fetchActiveProject, getProject } from './projects.js'
import { redrawBlocks } from './todoblock.js'
import { form, formRow } from './form.js'
import showPopup from './popup.js'
import { randomUUID } from '../functions.js'

const fetchTaskList = _ => JSON.parse(localStorage.getItem("tasks")) ?? {}

const storeTaskList = list => { localStorage.setItem("tasks", JSON.stringify(list)) }

const getTasksByProject = (project = null, list = null) => Object.entries(fetchTaskList()).filter(t => (!project || t[1].project == project) && (!list || t[1].todoList == list))

const getTasksByList = list => Object.entries(fetchTaskList()).filter(t => t[1].todoList == list)

const saveTaskEvent = state => e =>
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
  saveTask(state, taskName, projectId, description, todoList, code)
  state.popup.close()
}

const saveTask = (state, taskName, project, description, todoList, code) =>
{
  const list = state.todo.tasks.list
  list[randomUUID()] = { name: taskName, project: project, description: description, todoList: todoList, code: code }
  state.todo.tasks.list = list
  redrawBlocks(state)
}

const addTaskForm = state =>
  form("Add new task",
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
        submit: saveTaskEvent(state)
      }
    }
  )

const bindTaskList = state =>
({
  set: val => {
    storeTaskList(val)
    redrawBlocks(state)
  },
  get: _ => {
    let list = fetchTaskList()
    storeTaskList(list)
    return list
  }
})

const tasks = state =>
({
  bindings: {
    list: bindTaskList(state)
  }
})

const taskView = task =>
({
  taskview: {
    children: {
      taskname: { props: { innerText: task.name } },
      description: { props: { innerText: task.description } }
    }
  }
})

const taskLegend = (state, [id, task]) =>
({
  name: "tasklegend",
  props: {
    style: { backgroundColor: getProject(task.project).color },
    innerText: task.code,
    draggable: true,
    title: task.name
  },
  listeners: {
    dragstart: e => {
      state.todo.todoblocks.node.classList.add('dragging')
      e.dataTransfer.setData("task", id)
    },
    click: e => {
      showPopup(taskView(task), state)
    }
  }
})

export { addTaskForm, tasks, getTasksByProject, taskLegend }
