import { Element }   from '../element.js'
import { form, formRow } from './form.js'
import { randomUUID } from '../functions.js'
import { readData, saveData } from '../storage.js'
import Popup from './popup.js'
import state from '../state.js'

class Project extends Element
{
  children = {
    span: {
      props: {
        innerText: "Project"
      },
      children: {
        button: {
          props: { className: "add" },
          listeners: {
            click: e => new Popup(this.addProjectForm())
          }
        }
      }
    },
    selector: {
      bindings: {
        list: {
          set: val => {
            this.storeProjectList(val)
            this.children.selector.children = this.getProjectList(val, state.todo.activeWorkspace)
            this.children.selector.prepareNode(true)
          },
          get: _ => this.fetchProjectList()
        }
      },
      listeners: {
        change: e => state.todo.children.project.activeProject = e.target.options[e.target.selectedIndex].value ?? null
      },
      preRender: {
        getChildren: _ => {
          this.children.selector.children = this.getProjectList(
            this.fetchProjectList(),
            state.todo.children.workspace.activeWorkspace,
            this.fetchActiveProject()
          )
        }
      }
    },
    prev: {
      listeners: {
        click: e => {
          const projectList = Object.entries(this.getProjectList(this.fetchProjectList(), state.todo.children.workspace.activeWorkspace, this.activeProject))
          let index = projectList.findIndex(([id, val]) => val.id == this.activeProject)
          if (index < 0) {
            index = projectList.length
          }
          index -= 1
          this.activeProject = index <= 0 ? null : projectList[index][1].id
        }
      }
    },
    next: {
      listeners: {
        click: e => {
          const projectList = Object.entries(this.getProjectList(this.fetchProjectList(), state.todo.children.workspace.activeWorkspace, this.activeProject))
          let index = projectList.findIndex(([id, val]) => val.id == this.activeProject)
          if (index > projectList.length || index < 0) {
            index = 0
          }
          index += 1
          console.log(index)
          this.activeProject = index == projectList.length ? null : projectList[index][1].id
        }
      }
    }
  }
  bindings = {
    activeProject: {
      set: val => {
        this.storeActiveProject(val)
        const projectList = Object.values(this.children.selector.children)
        projectList.forEach(item => item.node.dataset.selected = false)
        projectList.find(item => item.id == (val ?? 'all')).node.dataset.selected = true
        state.todo.children.todoblocks.redraw()
      },
      get: _ => this.fetchActiveProject()
    }
  }

  getProjectCode = name => name.slice(5).toUpperCase()

  fetchProjectList = _ => readData("projects", {})

  storeProjectList = list => saveData("projects", list)

  fetchActiveProject = _ => readData("activeProject", null)

  storeActiveProject = val => saveData("activeProject", val)

  getProject = id => this.fetchProjectList()[id]

  getProjectList = (val, workspace = null, active = null) =>
    Object
      .entries({...{'all':{name: 'All'}}, ...val})
      .filter(p => p[0] == 'all' || !workspace || workspace == p[1].workspace)
      .map(([id, value]) =>
        ({
          name: "item",
          id: id,
          props: {
            innerText: value.name
          },
          data: {
            selected: active ? active == id : id == 'all'
          }
        })
      )

  getProjectOptions = (val, workspace = null, active = null) =>
    Object
      .entries({...{'':{name: ''}}, ...val})
      .filter(p => !p[0] || !workspace || workspace == p[1].workspace)
      .map(([id, value]) =>
        ({
          name: "option",
          props: {
            value: id,
            innerText: value.name,
            style: {
              backgroundColor: value.color
            },
            selected: active == id
          }
        })
      )

  saveProjectEvent = e =>
  {
    e.preventDefault()
    const formdata = new FormData(e.target)
    const projectName = formdata.get("projectname")
    const projectColor = formdata.get("projectcolor")
    const workspace = formdata.get("workspace")
    const code = projectName.replace(/\s+/, '').slice(0, 5).toUpperCase()
    this.saveProject(projectName, projectColor, workspace, code)
    state.popup.close()
  }

  saveProject = (projectName, projectColor, workspace, code) =>
  {
    const select = state.todo.children.project.children.selector
    const list = select.list
    list[randomUUID()] = { name: projectName, color: projectColor, workspace: workspace, code: code }
    select.list = list
  }

  addProjectForm = _ => form("Add new project",
    {
      projectName: formRow("Project name", { name: "input", props: { name: "projectname" } }),
      projectColor: formRow("Project color", {
        name: "input",
        props: {
          name: "projectcolor",
          type: "color",
          value: "#" + [0,0,0].map(_=>(192*Math.random()|0).toString(16)).join('').padStart(6, '0')
        }
      }),
      projectWorkspace: formRow("Workspace", {
        name: "select",
        props: { name: "workspace" },
        preRender: {
          getChildren: obj => {
            const workspace = state.todo.children.workspace
            obj.children = workspace.getWorkspaceOptions(workspace.children.selector.list, workspace.activeWorkspace)
          }
        }
      }),
      submit: { name: "input", props: { type: "submit" } }
    },
    {
      listeners: {
        submit: this.saveProjectEvent
      }
    }
  )
}

export default Project
