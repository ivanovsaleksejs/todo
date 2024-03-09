import { todoBlock } from '/components/todoblock.js'
import { workspace } from '/components/workspace.js'
import { project }   from '/components/projects.js'
import { tasks }     from '/components/tasks.js'
import actions       from '/components/actions.js'

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

