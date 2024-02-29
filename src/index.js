import element from '/element.js'
import todo from '/templates/todo.js'

const state = {}

console.log(todo)

const todoElement = element(todo)

document.addEventListener('load', todoElement.appendTo(document.body))
