import { getProjectList, fetchProjectList } from './projects.js'
import { redrawBlocks } from './todoblock.js'
import { form, formRow } from './form.js'
import { randomUUID }    from '../functions.js'
import { readData, saveData } from '../storage.js'
import showPopup from './popup.js'
import state     from '../state.js'

const saveWorkspaceEvent = e =>
{
  e.preventDefault()
  const workspaceName = (new FormData(e.target)).get("workspacename")
  saveWorkspace(workspaceName)
  state.popup.close()
}

const saveWorkspace = (workspaceName) =>
{
  const list = state.todo.workspace.select.list
  list[randomUUID()] = workspaceName
  state.todo.workspace.select.list = list
}

const fetchWorkspaceList = _ => readData("workspaces", {})

const storeWorkspaceList = list => saveData("workspaces", list)

const fetchActiveWorkspace = _ =>  readData("activeWorkspace", null)

const storeActiveWorkspace = val => saveData("activeWorkspace", val)

const getWorkspaceList = (val, active) =>
  Object.entries({...{'':''}, ...val}).map(
    ([id, value]) => ({
      name: "option",
      props: {
        value: id,
        innerText: value,
        selected: active == id
      }
    })
  )

const addWorkspaceForm = _ => form("Add new workspace",
  {
    workspaceName: formRow("Workspace Name", { name: "input", props: { name: "workspacename" } }),
    submit: { name: "input", props: { type: "submit" } }
  },
  {
    listeners: { submit: saveWorkspaceEvent }
  }
)

const bindWorkspaceList = {
  set: val => {
    storeWorkspaceList(val)
    state.todo.workspace.select.children = getWorkspaceList(val)
    state.todo.workspace.select.prepareNode(true)
  },
  get: fetchWorkspaceList
}

const setActiveWorkspace = e => {
  state.todo.workspace.activeWorkspace = e.target.options[e.target.selectedIndex].value
}

const workspace = _ =>
({
  children: {
    label: {
      props: {
        htmlFor: "workspace-selector",
        innerText: "Workspace"
      }
    },
    select: {
      props: { id: "workspace-selector" },
      children: getWorkspaceList(fetchWorkspaceList(), fetchActiveWorkspace()),
      bindings: {
        list: bindWorkspaceList
      },
      listeners: {
        change: setActiveWorkspace
      }
    },
    button: {
      props: { innerText: "Add workspace" },
      listeners: {
        click: e => {
          showPopup(addWorkspaceForm())
        }
      }
    }
  },
  bindings: {
    activeWorkspace: {
      set: val => {
        storeActiveWorkspace(val)
        state.todo.project.activeProject = null
        state.todo.project.select.children = getProjectList(fetchProjectList(), val)
        state.todo.project.select.prepareNode(true)
        redrawBlocks()
      },
      get: fetchActiveWorkspace
    }
  }
})

export { workspace, getWorkspaceList, fetchWorkspaceList, fetchActiveWorkspace }
