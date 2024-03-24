import { Element }   from '../element.js'
import { readData, saveData } from '../storage.js'
import TaskLegend from './tasklegend.js'
import Popup from './popup.js'
import state from '../state.js'

class TodoBlock extends Element
{
  name = "fieldset"

  bindings = {
    filterActive: {
      set: val => saveData(`filters.${this.blockName}.active`, val),
      get: _   => readData(`filters.${this.blockName}.active`)
    },
    preview: {
      set: val => saveData(`options.${this.blockName}.preview`, val),
      get: _   => readData(`options.${this.blockName}.preview`)
    }
  }

  postRender = {
    togglePreview: _ => {
      if (this.preview) {
        this.node.classList.add('preview')
      }
    }
  }

  filterMethods = {
    active: e => !this.filterActive || !e.closed
  }

  children = {
    legend: {
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
          }
        },
        addTask: {
          name: "button",
          props: { className: "add" },
          listeners: {
            click: e => new Popup(state.todo.children.tasks.addTaskForm(this.type))
          }
        },
      }
    },
    todoField: {
      preRender: {
        getChildren: obj => obj.assignChildren(obj)
      },
      assignChildren: obj => {
        const projectList = state.todo.children.project.children.selector.list
        const activeTasks = state.todo.children.tasks.activeTasks
        obj.children = Object.assign({},
          state.todo.children.tasks
            .getTasksByProject(
              state.todo.children.project.activeProject,
              this.type,
              state.todo.children.workspace.activeWorkspace
            )
            .filter(t => Object.values(this.filterMethods).every(f => f(t[1])))
            .map(([id, task]) => new TaskLegend([id, {
              ...task,
              color: projectList[task.project].color,
              active: activeTasks[task.project] ? activeTasks[task.project] == id : false
            }])))
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
          taskList[taskId].todoList = this.type
          state.todo.children.tasks.list = taskList
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
    this.children.legend.props = { innerText: blockName }
    this.children.todoField.fieldType = type
    this.children.legend.children.toggleActive.listeners = { click: this.toggleActive }
    this.children.legend.children.preview.listeners = { click: this.togglePreview }
  }

  redraw = _ =>
  {
    let todoField = this.children.todoField
    todoField.node.classList.remove("current")
    todoField.prepareNode(true)
  }

  togglePreview = e =>
  {
    this.preview = e.target.checked
    e.target.checked ? this.node.classList.add("preview") : this.node.classList.remove("preview")
  }

  toggleActive = e =>
  {
    this.filterActive = e.target.checked
    this.redraw()
  }
}

export default TodoBlock
