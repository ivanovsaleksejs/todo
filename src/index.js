import element from './element.js'
import todo from './components/todo.js'

const state = {}

state.todo = element(todo(state))
state.todo.appendTo(document.body)
