import TaskView from './taskview.js'
import Popup    from './popup.js'
import Element  from '../element.js'
import state    from '../state.js'

class TaskLegend extends Element
{
  children = {
    code: {},
    info: {},
    tooltip: {}
  }

  listeners = {
    click: e => new Popup(new TaskView(this.id, this.task)),
    dragstart: e => {
      state.todo.todoblocks.node.classList.add("dragging")
      e.dataTransfer.setData("task", this.id)
    }
  }

  bindings = {
    task: {
      get: _ => state.todo.tasks.getTaskById(this.id)
    }
  }

  constructor([id, task])
  {
    super()

    this.id = id
    this.code.props = { innerText: task.code }
    this.props = {
      style: { backgroundColor: task.color },
      draggable: true,
      className: [task.closed ? "closed" : null, task.active ? "active" : null].join(" ")
    }
    this.tooltip.props = { innerText: task.name }
  }
}

export default TaskLegend

