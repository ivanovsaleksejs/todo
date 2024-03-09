import element from '/element.js'
import todo from '/components/todo.js'

const state = {}

window.addEventListener("load", async _ => {
  state.todo = await element(todo(state))
  state.todo.appendTo(document.body)
})
