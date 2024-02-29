import element from '/element.js'
import todo from '/templates/todo.js'

const state = {}

console.log(todo)

document.addEventListener('load', element(todo).appendTo(document.body))
