import showPopup from '/components/popup.js'
import { addTaskForm } from '/components/tasks.js'
import { addProjectForm } from '/components/projects.js'

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
