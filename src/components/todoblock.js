import { Element }   from '../element.js'
import { readData, saveData } from '../storage.js'
import TaskLegend from './tasklegend.js'
import Popup from './popup.js'
import state from '../state.js'

class TodoBlock extends Element
{
  name = "fieldset"

  bindings = {
    filterOpened: {
      set: val => saveData(`filters.${this.blockName}.opened`, val),
      get: _   => readData(`filters.${this.blockName}.opened`)
    },
    preview: {
      set: val => saveData(`options.${this.blockName}.preview`, val),
      get: _   => readData(`options.${this.blockName}.preview`)
    },
    filterActive: {
      set: val => saveData(`options.${this.blockName}.active`, val),
      get: _   => readData(`options.${this.blockName}.active`)
    }
  }

  postRender = {
    togglePreview: _ => {
      if (this.preview) {
        this.node.classList.add("preview")
      }
    }
  }

  filterMethods = {
    opened: e => !this.filterOpened || !e.closed,
    active: e => !this.filterActive || e.active
  }

  children = {
    legend: {
      children: {
        preview: {
          name: "input",
          props: {
            type: "checkbox",
            className: "toggle preview",
            checked: this.preview,
            title: "Toggle task view"
          },
          preRender: {
            isChecked: obj => obj.props.checked = this.preview
          }
        },
        toggleOpened: {
          name: "input",
          props: {
            type: "checkbox",
            className: "toggle opened",
            checked: this.filterOpened,
            title: "Show only open tasks"
          },
          preRender: {
            isChecked: obj => obj.props.checked = this.filterOpened
          }
        },
        toggleActive: {
          name: "input",
          props: {
            type: "checkbox",
            className: "toggle active",
            checked: this.filterActive,
            title: "Show only active tasks"
          },
          preRender: {
            isChecked: obj => obj.props.checked = this.filterActive
          }
        },
        addTask: {
          name: "button",
          props: { className: "add" },
          listeners: {
            click: e => new Popup(state.todo.tasks.addTaskForm(this.type))
          }
        },
      }
    },
    todoField: {
      preRender: {
        getChildren: obj => obj.assignChildren(obj)
      },
      assignChildren: obj => {
        obj.children = Object.assign({},
          state.todo.tasks
            .getTasksByProject(
              state.todo.project.activeProject,
              this.type,
              state.todo.workspace.activeWorkspace
            )
            .filter(t => Object.values(this.filterMethods).every(f => f(t[1])))
            .map(t => new TaskLegend(t))
        )
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
          state.todo.todoblocks.node.classList.remove("dragging")
          const taskId = e.dataTransfer.getData("task")
          const taskList = state.todo.tasks.list
          taskList[taskId].todoList = this.type
          state.todo.tasks.list = taskList
        }
      }
    }
  }

  constructor(blockName, type, className = "todo-block")
  {
    super()

    this.blockName = blockName,
    this.type = type
    this.props = { className: className }
    this.legend.props = { innerText: blockName }
    this.todoField.fieldType = type
    this.legend.toggleOpened.listeners = { click: this.toggleOpened }
    this.legend.toggleActive.listeners = { click: this.toggleActive }
    this.legend.preview.listeners = { click: this.togglePreview }
  }

  redraw = _ =>
  {
    let todoField = this.todoField
    todoField.node.classList.remove("current")
    todoField.prepareNode(true)
  }

  togglePreview = e =>
  {
    this.preview = e.target.checked
    e.target.checked ? this.node.classList.add("preview") : this.node.classList.remove("preview")
  }

  toggleOpened = e =>
  {
    this.filterOpened = e.target.checked
    this.redraw()
  }

  toggleActive = e =>
  {
    this.filterActive = e.target.checked
    this.redraw()
  }
}

export default TodoBlock
