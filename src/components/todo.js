import { todoBlock } from './todoblock.js'
import { workspace } from './workspace.js'
import { project }   from './projects.js'
import { tasks }     from './tasks.js'
import actions       from './actions.js'

const todo = state =>
({
  name: "todo",
  children: {
    workspace: workspace(state),
    project: project(state),
    tasks: tasks(state),
    actions: actions(state),
    todoblocks: {
      children: {
        backlog: todoBlock(state, "Backlog", "backlog"),
        current: todoBlock(state, "Current", "current", "todo-block current"),
        planned: todoBlock(state, "Planned", "planned"),
      }
    }
  }
})

export default todo

