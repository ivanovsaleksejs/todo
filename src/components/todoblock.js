import { getTasksByProject, taskLegend } from './tasks.js'
import { fetchActiveProject } from './projects.js'
import state from '../state.js'

const redrawBlocks = _ =>
  Object.values(state.todo.todoblocks.children).map(b => {
    b.todoField.node.classList.remove("current")
    b.todoField.prepareNode(true)
  })

const togglePreview = e => {
  let node = e.target.component.parent.parent.node
  e.target.checked ? node.classList.add("preview") : node.classList.remove("preview")
}

const todoBlock = (blockName, type, className = "todo-block") =>
({
  name: "fieldset",
  props: { className: className },
  children: {
    legend: {
      props: {
        innerText: blockName
      },
      children: {
        preview: {
          name: "input",
          props: { id: `${type}-preview`, type: "checkbox" },
          listeners: {
            change: togglePreview
          }
        },
        label: { props: { htmlFor: `${type}-preview`, innerText: "Toggle preview" } }
      }
    },
    todoField: {
      fieldType: type,
      preRender: {
        getChildren: obj => {
          obj.children = Object.assign({}, getTasksByProject(fetchActiveProject(), type).map(t => taskLegend(t)))
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
