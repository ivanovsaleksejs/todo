import showPopup from './popup.js'
import { addTaskForm } from './tasks.js'
import { addProjectForm } from './projects.js'

const actions = state =>
({
  children: {
    addTask: {
      name: "button",
      props: { innerText: "Add task" },
      listeners: {
        click: e => {
          showPopup(addTaskForm(state), state)
        }
      }
    },
  }
})

export default actions
