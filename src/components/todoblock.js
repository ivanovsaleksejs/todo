import { Element }   from '../element.js'
import TaskLegend from './tasklegend.js'
import Popup from './popup.js'
import state from '../state.js'

class TodoBlock extends Element
{
  name = "fieldset"

  constructor(blockName, type, className = "todo-block")
  {
    super()
    Object.assign(this, {
      props: { className: className },
      children: {
        legend: {
          props: {
            innerText: blockName
          },
          children: {
            preview: {
              name: "input",
              props: {
                type: "checkbox",
                className: "toggle-preview"
              },
              listeners: {
                change: this.togglePreview
              }
            },
            addTask: {
              name: "button",
              props: { className: "add" },
              listeners: {
                click: e => new Popup(state.todo.children.tasks.addTaskForm(type))
              }
            }
          }
        },
        todoField: {
          fieldType: type,
          preRender: {
            getChildren: obj => obj.assignChildren(obj)
          },
          assignChildren: obj => {
            obj.children = Object.assign({}, state.todo.children.tasks.getTasksByProject(
              state.todo.children.project.activeProject,
              type,
              state.todo.children.workspace.activeWorkspace
            ).map(t => new TaskLegend(t)))
          },
          listeners: {
            dragover: e => {
              e.preventDefault()
              Object.values(state.todo.children.todoblocks.children).map(b => {
                b.children.todoField.node.classList.remove("current")
              })
              e.target.classList.add("current")
            },
            drop: e => {
              state.todo.children.todoblocks.node.classList.remove('dragging')
              const taskId = e.dataTransfer.getData("task")
              const taskList = state.todo.children.tasks.list
              taskList[taskId].todoList = type
              state.todo.children.tasks.list = taskList
            }
          }
        }
      }
    })
  }

  redraw()
  {
    let todoField = this.children.todoField
    todoField.node.classList.remove("current")
    todoField.assignChildren(todoField)
    todoField.prepareNode(true)
  }

  togglePreview = e => {
    e.target.checked ? this.node.classList.add("preview") : this.node.classList.remove("preview")
  }
}

export default TodoBlock
