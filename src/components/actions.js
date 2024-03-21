import { Element } from '../element.js'
import Popup from './popup.js'
import state     from '../state.js'

class Actions extends Element
{
  children = {
    addTask: {
      name: "button",
      props: { innerText: "Add task" },
      listeners: {
        click: e => new Popup(state.todo.children.tasks.addTaskForm())
      }
    },
  }
}

export default Actions
