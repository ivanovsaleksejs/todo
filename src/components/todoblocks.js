import { Element }   from '../element.js'
import TodoBlock from './todoblock.js'

class TodoBlocks extends Element
{
  preRender = {
    getChildren: _ => this.assignChildren()
  }

  assignChildren = _ =>
  {
    this.children = {
      backlog: new TodoBlock("Backlog", "backlog"),
      current: new TodoBlock("Current", "current", "todo-block current"),
      planned: new TodoBlock("Planned", "planned")
    }
  }

  redraw = _ => Object.values(this.children).map(b => b.redraw())
}

export default TodoBlocks
