import { form, formRow } from './form.js'
import { Element }   from '../element.js'
import state     from '../state.js'

class TaskView extends Element
{
  constructor(id, task)
  {
    super()

    this.id = id
    task.active = state.todo.children.tasks.activeTasks[task.project] == id
    this.task = task
    this.children = {
      taskname: { props: { innerText: `${task.code} ${task.name}` } },
      description: { props: { innerText: task.description } },
      done: formRow("Completed", {
        name: "input",
        props: { name: "done", type: "checkbox", checked: task.closed },
        listeners: {
          click: e => this.closeTask(e.target.checked)
        }
      }),
      active: formRow("Active", {
        name: "input",
        props: { name: "active", type: "checkbox", checked: task.active },
        listeners: {
          click: e => this.setActive(e.target.checked)
        }
      })
    }
  }

  closeTask = checked =>
  {
    const tasks = state.todo.children.tasks.list
    tasks[this.id].closed = checked
    state.todo.children.tasks.list = tasks
    state.popup.close()
  }

  setActive = checked =>
  {
    const activeTasks = state.todo.children.tasks.activeTasks
    activeTasks[this.task.project] = checked ? this.id : null
    state.todo.children.tasks.activeTasks = activeTasks
    state.popup.close()
  }
}

export default TaskView
