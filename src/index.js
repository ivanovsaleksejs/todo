import element from './element.js'
import state from './state.js'
import todo from './components/todo.js'

state.todo = element(todo)
state.todo.appendTo(document.body)
