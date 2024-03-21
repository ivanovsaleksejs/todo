import { Element }   from '../element.js'
import { form, formRow } from './form.js'
import { randomUUID }    from '../functions.js'
import { readData, saveData } from '../storage.js'
import Popup from './popup.js'
import state from '../state.js'

class Workspace extends Element
{
  children = {
    label: {
      props: {
        htmlFor: "workspace-selector",
        innerText: "Workspace"
      }
    },
    select: {
      props: { id: "workspace-selector" },
      bindings: {
        list: {
          set: val => {
            this.storeWorkspaceList(val)
            this.children.select.children = this.getWorkspaceList(val)
            this.children.select.prepareNode(true)
          },
          get: _ => this.fetchWorkspaceList()
        }
      },
      listeners: {
        change: e => this.activeWorkspace = e.target.options[e.target.selectedIndex].value
      },
      preRender: {
        getChildren: _ => this.children.select.children = this.getWorkspaceList(this.fetchWorkspaceList(), this.fetchActiveWorkspace())
      }
    },
    button: {
      props: { innerText: "Add workspace" },
      listeners: {
        click: e => {
          new Popup(this.addWorkspaceForm())
        }
      }
    }
  }
  bindings = {
    activeWorkspace: {
      set: val => {
        this.storeActiveWorkspace(val)
        const project = state.todo.children.project
        project.activeProject = null
        project.children.select.children = project.getProjectList(project.fetchProjectList(), val)
        project.children.select.prepareNode(true)
        state.todo.children.todoblocks.redraw()
      },
      get: _ => this.fetchActiveWorkspace()
    }
  }

  addWorkspaceForm = _ =>
    form("Add new workspace",
      {
        workspaceName: formRow("Workspace Name", { name: "input", props: { name: "workspacename" } }),
        submit: { name: "input", props: { type: "submit" } }
      },
      {
        listeners: { submit: this.saveWorkspaceEvent }
      }
    )

  saveWorkspaceEvent = e =>
  {
    e.preventDefault()
    const workspaceName = (new FormData(e.target)).get("workspacename")
    this.saveWorkspace(workspaceName)
    state.popup.close()
  }

  saveWorkspace = workspaceName =>
  {
    const list = this.children.select.list
    list[randomUUID()] = workspaceName
    this.children.select.list = list
  }

  fetchWorkspaceList = _ => readData("workspaces", {})

  storeWorkspaceList = list => saveData("workspaces", list)

  fetchActiveWorkspace = _ =>  readData("activeWorkspace", null)

  storeActiveWorkspace = val => saveData("activeWorkspace", val)

  getWorkspaceList = (val, active) =>
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
}

export default Workspace
