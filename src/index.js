import state from './state.js'
import Todo from './components/todo.js'

state.todo = new Todo()
state.todo.appendTo(document.body)
