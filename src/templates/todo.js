import todoBlock from '/templates/todoblock.js'

const todo = {
  name: "todo",
  children: {
    backlog: todoBlock,
    current: todoBlock,
    planned: todoBlock
  }
}

export default todo

