import { todoBlock } from './todoblock.js'
import { workspace } from './workspace.js'
import { project }   from './projects.js'
import { tasks }     from './tasks.js'
import actions       from './actions.js'
import state         from '../state.js'

const todo = {
  name: "todo",
  children: {
    workspace: workspace(),
    project: project(),
    tasks: tasks(),
    actions: actions(),
    todoblocks: {
      preRender: {
        getChildren: obj => obj.assignChildren(obj)
      },
      assignChildren: obj => obj.children = {
        backlog: todoBlock("Backlog", "backlog"),
        current: todoBlock("Current", "current", "todo-block current"),
        planned: todoBlock("Planned", "planned"),
      }
    }
  }
}

export default todo

