import Element from '../element.js'
import TodoBlocks  from './todoblocks.js'
import Workspace   from './workspace.js'
import Project     from './projects.js'
import Tasks       from './tasks.js'
import state       from '../state.js'

class Todo extends Element
{
  children = {
    tasks: new Tasks(),
    workspace: new Workspace(),
    project: new Project(),
    todoblocks: new TodoBlocks()
  }

  listeners = {
    click: e => {
      if (state.popup?.opened) {
        state.popup.close()
      }
    }
  }
}

export default Todo
