import TaskView from './taskview.js'
import Popup from './popup.js'
import { Element }   from '../element.js'
import state     from '../state.js'

class TaskLegend extends Element
{
  constructor([id, task])
  {
    super()

    Object.assign(this,
      {
        props: {
          style: { backgroundColor: state.todo.children.project.getProject(task.project).color },
          innerText: task.code,
          draggable: true,
          className: task.closed ? "closed" : ""
        },
        children: {
          info: {},
          tooltip: { props: { innerText: task.name } }
        },
        listeners: {
          dragstart: e => {
            state.todo.children.todoblocks.node.classList.add('dragging')
            e.dataTransfer.setData("task", id)
          },
          click: e => new Popup(new TaskView(id, task))
        }
      }
    )
  }
}

export default TaskLegend

