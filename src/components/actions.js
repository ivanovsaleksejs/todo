import { addTaskForm } from './tasks.js'
import { addProjectForm } from './projects.js'
import showPopup from './popup.js'
import state     from '../state.js'

const actions = _ =>
({
  children: {
    addTask: {
      name: "button",
      props: { innerText: "Add task" },
      listeners: {
        click: e => {
          showPopup(addTaskForm())
        }
      }
    },
  }
})

export default actions
