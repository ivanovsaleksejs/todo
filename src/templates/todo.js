import todoBlock from '/templates/todoblock.js'

const todo = {
  name: "todo",
  children: {
    backlog: todoBlock(),
    current: todoBlock("todo-block current"),
    planned: todoBlock(),
  }
}

export default todo

