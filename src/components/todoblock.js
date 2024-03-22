import { Element }   from '../element.js'
import { readData, saveData } from '../storage.js'
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
      postRender: {
        togglePreview: _ => {
          console.log(this.preview)
          if (this.preview) {
            this.node.classList.add('preview')
          }
        }
      },
      filterMethods: {
        active: e => !this.filterActive || !e.closed
      },
      bindings: {
        filterActive: {
          set: val => saveData(`filters.${blockName}.active`, val),
          get: _   => readData(`filters.${blockName}.active`)
        },
        preview: {
          set: val => saveData(`options.${blockName}.preview`, val),
          get: _   => readData(`options.${blockName}.preview`)
        }
      },
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
                className: "toggle-preview",
                checked: this.preview,
                title: "Toggle task view"
              },
              preRender: {
                isChecked: obj => obj.props.checked = this.preview
              },
              listeners: {
                change: this.togglePreview
              }
            },
            toggleActive: {
              name: "input",
              props: {
                type: "checkbox",
                className: "toggle-active",
                checked: this.filterActive,
                title: "Show only open tasks"
              },
              preRender: {
                isChecked: obj => obj.props.checked = this.filterActive
              },
              listeners: {
                change: this.toggleActive
              }
            },
            addTask: {
              name: "button",
              props: { className: "add" },
              listeners: {
                click: e => new Popup(state.todo.children.tasks.addTaskForm(type))
              }
            },
          }
        },
        todoField: {
          fieldType: type,
          preRender: {
            getChildren: obj => obj.assignChildren(obj)
          },
          assignChildren: obj => {
            obj.children = Object.assign({},
              state.todo.children.tasks
                .getTasksByProject(
                  state.todo.children.project.activeProject,
                  type,
                  state.todo.children.workspace.activeWorkspace
                )
                .filter(t => Object.values(this.filterMethods).every(f => f(t[1])))
                .map(t => new TaskLegend(t)))
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
    todoField.prepareNode(true)
  }

  togglePreview = e => {
    this.preview = e.target.checked
    e.target.checked ? this.node.classList.add("preview") : this.node.classList.remove("preview")
  }

  toggleActive = e => {
    this.filterActive = e.target.checked
    this.redraw()
  }
}

export default TodoBlock
