import { Element }   from '../element.js'
import { form, formRow } from './form.js'
import { randomUUID }    from '../functions.js'
import { readData, saveData, exportData } from '../storage.js'
import Popup from './popup.js'
import state from '../state.js'

class Workspace extends Element
{
  children = {
    span: {
      props: {
        innerText: "Workspace"
      },
      children: {
        button: {
          props: { className: "add" },
          listeners: {
            click: e => new Popup(this.addWorkspaceForm())
          }
        },
        export: {
          listeners: {
            click: exportData
          }
        }
      }
    },
    selector: {
      bindings: {
        list: {
          set: val => {
            this.storeWorkspaceList(val)
            this.children.selector.children = this.getWorkspaceList(val)
            this.children.selector.prepareNode(true)
          },
          get: _ => this.fetchWorkspaceList()
        }
      },
      preRender: {
        getChildren: _ => this.children.selector.children = this.getWorkspaceList(this.fetchWorkspaceList(), this.fetchActiveWorkspace())
      }
    },
    prev: {
      listeners: {
        click: e => {
          const workspaceList = Object.entries(this.fetchWorkspaceList())
          let index = workspaceList.findIndex(([id, val]) => id == this.activeWorkspace)
          if (index < 0) {
            index = workspaceList.length
          }
          index -= 1
          this.activeWorkspace = index < 0 ? null : workspaceList[index][0]
        }
      }
    },
    next: {
      listeners: {
        click: e => {
          const workspaceList = Object.entries(this.fetchWorkspaceList())
          let index = workspaceList.findIndex(([id, val]) => id == this.activeWorkspace)
          if (index > workspaceList.length) {
            index = 0
          }
          index += 1
          this.activeWorkspace = index == workspaceList.length ? null : workspaceList[index][0]
        }
      }
    }
  }

  bindings = {
    activeWorkspace: {
      set: val => {
        this.storeActiveWorkspace(val)
        const workspaceList = Object.values(this.children.selector.children)
        workspaceList.forEach(item => item.node.dataset.selected = false)
        workspaceList.find(item => item.id == (val ?? 'all')).node.dataset.selected = true
        const project = state.todo.children.project
        project.activeProject = null
        project.children.selector.children = project.getProjectList(project.fetchProjectList(), val)
        project.children.selector.prepareNode(true)
        state.todo.children.todoblocks.redraw()
      },
      get: _ => this.fetchActiveWorkspace()
    }
  }

  addWorkspaceForm = (id, value) =>
    form(`${id ? "Edit" : "Add new"} workspace`,
      {
        workspaceName: formRow(
          "Workspace Name",
          {
            name: "input",
            props: {
              name: "workspacename",
              value: id ? value : ""
            }
          }
        ),
        workspaceId: { name: "input", props: { type: "hidden", name: "id", value: (id ?? '') } },
        submit: { name: "input", props: { type: "submit" } }
      },
      {
        listeners: { submit: this.saveWorkspaceEvent }
      }
    )

  saveWorkspaceEvent = e =>
  {
    e.preventDefault()
    const formData = new FormData(e.target)
    const workspaceName = formData.get("workspacename")
    const workspaceId = formData.get("id")
    this.saveWorkspace(workspaceName, workspaceId ? workspaceId : randomUUID())
    state.popup.close()
  }

  saveWorkspace = (workspaceName, workspaceId) =>
  {
    const list = this.children.selector.list
    list[workspaceId] = workspaceName
    this.children.selector.list = list
  }

  fetchWorkspaceList = _ => readData("workspaces", {})

  storeWorkspaceList = list => saveData("workspaces", list)

  fetchActiveWorkspace = _ =>  readData("activeWorkspace", null)

  storeActiveWorkspace = val => saveData("activeWorkspace", val)

  getWorkspaceList = (val, active) =>
    Object
      .entries({...{"all":"All"}, ...val})
      .map(([id, value]) =>
        ({
          name: "item",
          id: id,
          props: {
            innerText: value,
          },
          data: {
            selected: active ? active == id : id == "all"
          },
          children: id == "all" ? {} : {
            edit: {
              listeners: {
                click: e => new Popup(this.addWorkspaceForm(id, value))
              }
            }
          }
        })
      )

  getWorkspaceOptions = (val, active) =>
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
