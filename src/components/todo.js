import { Element } from '../element.js'
import TodoBlocks  from './todoblocks.js'
import Workspace   from './workspace.js'
import Project     from './projects.js'
import Tasks       from './tasks.js'
import Actions     from './actions.js'

class Todo extends Element
{
  children = {
    tasks: new Tasks(),
    workspace: new Workspace(),
    project: new Project(),
    actions: new Actions(),
    todoblocks: new TodoBlocks()
  }
}

export default Todo
