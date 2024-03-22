import { form, formRow } from './form.js'
import { Element }   from '../element.js'
import state     from '../state.js'

class TaskView extends Element
{
  constructor(id, task)
  {
    super()

    this.children = {
      taskname: { props: { innerText: task.name } },
      description: { props: { innerText: task.description } },
      done: formRow("Completed", {
        name: "input",
        props: { name: "done", type: "checkbox", checked: task.closed },
        listeners: {
          click: e => this.closeTask(id, e.target.checked)
        }
      })
    }
  }

  closeTask = (id, checked) =>
  {
    const tasks = state.todo.children.tasks.list
    tasks[id].closed = checked
    state.todo.children.tasks.list = tasks
    state.popup.close()
  }
}

export default TaskView
