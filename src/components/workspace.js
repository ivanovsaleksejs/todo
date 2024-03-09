import { getProjectList, fetchProjectList } from '/components/projects.js'
import { form, formRow } from '/components/form.js'
import showPopup from '/components/popup.js'

const saveWorkspaceEvent = state => e =>
{
  e.preventDefault()
  const workspaceName = (new FormData(e.target)).get("workspacename")
  saveWorkspace(state, workspaceName)
  state.popup.close()
}

const saveWorkspace = (state, workspaceName) =>
{
  const list = state.todo.workspace.select.list
  list[crypto.randomUUID()] = workspaceName
  state.todo.workspace.select.list = list
}

const fetchWorkspaceList = _ => JSON.parse(localStorage.getItem("workspaces")) ?? {}

const storeWorkspaceList = list => { localStorage.setItem("workspaces", JSON.stringify(list)) }

const fetchActiveWorkspace = _ => localStorage.getItem('activeWorkspace') ?? null

const storeActiveWorkspace = val => { localStorage.setItem("activeWorkspace", val) }

const getWorkspaceList = (val, state, active) =>
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

const addWorkspaceForm = state =>
  form("Add new workspace",
    {
      workspaceName: formRow("Workspace Name", { name: "input", props: { name: "workspacename" } }),
      submit: { name: "input", props: { type: "submit" } }
    },
    {
      listeners: {
        submit: saveWorkspaceEvent(state)
      }
    }
  )

const bindWorkspaceList = state =>
({
  set: val => {
    storeWorkspaceList(val)
    state.todo.workspace.select.children = getWorkspaceList(val, state)
    state.todo.workspace.select.prepareNode(true)
  },
  get: _ => {
    let list = fetchWorkspaceList()
    storeWorkspaceList(list)
    return list
  }
})

const setActiveWorkspace = state => e => {
  state.todo.workspace.activeWorkspace = e.target.options[e.target.selectedIndex].value
  state.todo.project.activeProject = null
}

const workspace = state =>
({
  children: {
    label: {
      props: {
        htmlFor: "workspace-selector",
        innerText: "Workspace"
      }
    },
    select: {
      name: "select",
      props: { id: "workspace-selector" },
      children: getWorkspaceList(fetchWorkspaceList(), state, fetchActiveWorkspace()),
      bindings: {
        list: bindWorkspaceList(state)
      },
      listeners: {
        change: setActiveWorkspace(state)
      }
    },
    button: {
      props: { innerText: "Add workspace" },
      listeners: {
        click: e => {
          showPopup(addWorkspaceForm(state), state)
        }
      }
    }
  },
  bindings: {
    activeWorkspace: {
      set: val => {
        storeActiveWorkspace(val)
        state.todo.project.select.children = getProjectList(fetchProjectList(), val)
        state.todo.project.select.prepareNode(true)
      },
      get: fetchActiveWorkspace
    }
  }
})

export { workspace, getWorkspaceList, fetchWorkspaceList, fetchActiveWorkspace }
