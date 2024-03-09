import { fetchActiveProject } from '/components/projects.js'
import { getTasksByProject, taskLegend } from '/components/tasks.js'

const redrawBlocks = state =>
  Object.values(state.todo.todoblocks.children).map(b => {
    b.todoField.node.classList.remove("current")
    b.todoField.prepareNode(true)
  })

const todoBlock = (state, blockName, type, className = "todo-block") =>
({
  name: "fieldset",
  props: { className: className },
  children: {
    legend: {
      props: {
        innerText: blockName
      }
    },
    todoField: {
      fieldType: type,
      preRender: {
        getChildren: obj => {
          obj.children = Object.assign({}, getTasksByProject(fetchActiveProject(), type).map(t => taskLegend(state, t)))
        }
      },
      listeners: {
        dragover: e => {
          e.preventDefault()
          Object.values(state.todo.todoblocks.children).map(b => {
            b.todoField.node.classList.remove("current")
          })
          e.target.classList.add("current")
        },
        drop: e => {
          state.todo.todoblocks.node.classList.remove('dragging')
          const taskId = e.dataTransfer.getData("task")
          const taskList = state.todo.tasks.list
          taskList[taskId].todoList = type
          state.todo.tasks.list = taskList
        }
      }
    }
  }
})

export { todoBlock, redrawBlocks }
