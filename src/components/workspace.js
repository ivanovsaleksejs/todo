import Element   from '../element.js'
import { form, formRow } from './form.js'
import { randomUUID }    from '../functions.js'
import { readData, saveData, exportData, importData } from '../storage.js'
import TaskLegend from './tasklegend.js'
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
        },
        import: {
          listeners: {
            click: importData
          }
        }
      }
    },
    selector: {
      bindings: {
        list: {
          set: val => {
            this.storeWorkspaceList(val)
            this.selector.children = this.getWorkspaceList(val)
            this.selector.prepareNode(true)
          },
          get: _ => this.fetchWorkspaceList()
        }
      },
      preRender: {
        getChildren: _ => this.selector.children = this.getWorkspaceList(this.fetchWorkspaceList(), this.fetchActiveWorkspace())
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
        const workspaceList = Object.values(this.selector.children)
        workspaceList.forEach(item => item.node.dataset.selected = false)
        workspaceList.find(item => item.id == (val ?? "all")).node.dataset.selected = true
        const project = state.todo.project
        if (project.activeProject && project.getProject(project.activeProject).workspace !== val) {
          project.activeProject = null
        }
        project.selector.list = project.selector.list
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
        workspaceId: { name: "input", props: { type: "hidden", name: "id", value: (id ?? "") } },
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
    const list = this.selector.list
    list[workspaceId] = workspaceName
    this.selector.list = list
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
            options: {
              children:{
                edit: {
                  listeners: {
                    click: e => new Popup(this.addWorkspaceForm(id, value))
                  }
                },
                delete: {
                  listeners: {
                    click: e => new Popup(this.deleteWorkspaceForm(id, value))
                  }
                }
              }
            }
          }
        })
      )

  getWorkspaceOptions = (val, active) =>
    Object.entries({...{"":""}, ...val}).map(
      ([id, value]) => ({
        name: "option",
        props: {
          value: id,
          innerText: value,
          selected: active == id
        }
      })
    )

  deleteWorkspaceForm = (id, name) =>
    ({
      header: { props: { innerHTML: `Delete the workspace <b>${name}</b> and all its projects and tasks? Cannot be undone!` } },
      workspaceInfo: {
        children: Object.assign({}, [
            { name: "p", props: { innerText: "Projects and tasks assigned to this workspace:" } },
            ...state.todo.project
              .getProjectList(id)
              .filter(p => p.id !== 'all')
              .map(p => {
                const project = state.todo.project.getProject(p.id)
                return {
                  name: "projectinfo",
                  props: { className: "preview" },
                  children: Object.assign({}, [
                    { name: "p", props: { innerHTML: `Project <b>${project.name}</b> has these tasks assigned to it:` } },
                    ...state.todo.tasks
                      .getTasksByProject(p.id)
                      .map(t => new TaskLegend(t))
                  ])
                }
              }
              )
          ])
      },
      buttons: {
        children: {
          ok: {
            props: { innerText: "OK", className: "danger" },
            listeners: {
              click: _ => this.deleteWorkspace(id)
            }
          },
          cancel: {
            props: { innerText: "Cancel" },
            listeners: {
              click: _ => state.popup.close()
            }
          }
        }
      }
    })

  deleteWorkspace = id =>
  {
    const select = state.todo.workspace.selector
    const list = select.list
    const project = state.todo.project
    project.getProjectList(id).filter(p => p.id !== 'all').forEach(p => project.deleteProject(p.id))
    delete list[id]
    this.activeWorkspace = this.activeWorkspace == id ? null : this.activeWorkspace
    select.list = list
    state.popup?.close()
  }
}

export default Workspace
