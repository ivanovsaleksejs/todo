import { getWorkspaceList, fetchWorkspaceList, fetchActiveWorkspace } from '/components/workspace.js'
import { redrawBlocks } from '/components/todoblock.js'
import { form, formRow } from '/components/form.js'
import showPopup from '/components/popup.js'

const getProjectCode = name => name.slice(5).toUpperCase()

const fetchProjectList = _ => JSON.parse(localStorage.getItem("projects")) ?? {}

const storeProjectList = list => { localStorage.setItem("projects", JSON.stringify(list)) }

const fetchActiveProject = _ => localStorage.getItem('activeProject') ?? null

const storeActiveProject = val => { localStorage.setItem("activeProject", val) }

const getProjectList = (val, workspace = null, active = null) =>
  Object
    .entries({...{'':{name: ''}}, ...val})
    .filter(p => !p[0] || !workspace || workspace == p[1].workspace)
    .map(([id, value]) => ({
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

const getProject = id => fetchProjectList()[id]

const saveProjectEvent = state => e =>
{
  e.preventDefault()
  const formdata = new FormData(e.target)
  const projectName = formdata.get("projectname")
  const projectColor = formdata.get("projectcolor")
  const workspace = formdata.get("workspace")
  const code = projectName.replace(/\s+/, '').slice(0, 5).toUpperCase()
  saveProject(state, projectName, projectColor, workspace, code)
  state.popup.close()
}

const saveProject = (state, projectName, projectColor, workspace, code) =>
{
  const list = state.todo.project.select.list
  list[crypto.randomUUID()] = { name: projectName, color: projectColor, workspace: workspace, code: code }
  state.todo.project.select.list = list
}

const addProjectForm = state =>
  form("Add new project",
    {
      projectName: formRow("Project name", { name: "input", props: { name: "projectname" } }),
      projectColor: formRow("Project color", {
        name: "input",
        props: {
          name: "projectcolor",
          type: "color",
          value: "#" + (Math.random()*16777216 >>> 0).toString(16).padStart(6, '0')
        }
      }),
      projectWorkspace: formRow("Workspace", {
        name: "select",
        props: { name: "workspace" },
        children: getWorkspaceList(fetchWorkspaceList(), state, fetchActiveWorkspace())
      }),
      submit: { name: "input", props: { type: "submit" } }
    },
    {
      listeners: {
        submit: saveProjectEvent(state)
      }
    }
  )

const bindProjectList = state =>
({
  set: (val) => {
    storeProjectList(val)
    state.todo.project.select.children = getProjectList(val, fetchActiveWorkspace())
    state.todo.project.select.prepareNode(true)
  },
  get: _ => {
    let list = fetchProjectList()
    storeProjectList(list)
    return list
  }
})

const setActiveProject = state => e => state.todo.project.activeProject = e.target.options[e.target.selectedIndex].value

const project = state =>
({
  children: {
    label: {
      props: {
        htmlFor: "project-selector",
        innerText: "Project"
      }
    },
    select: {
      name: "select",
      props: { id: "project-selector" },
      children: getProjectList(fetchProjectList(), fetchActiveWorkspace(), fetchActiveProject()),
      bindings: {
        list: bindProjectList(state)
      },
      listeners: {
        change: setActiveProject(state)
      }
    },
    button: {
      props: { innerText: "Add project" },
      listeners: {
        click: e => {
          showPopup(addProjectForm(state), state)
        }
      }
    }
  },
  bindings: {
    activeProject: {
      set: val => {
        storeActiveProject(val)
        redrawBlocks(state)
      },
      get: fetchActiveProject
    }
  }
})

export { addProjectForm, getProjectList, fetchProjectList, fetchActiveProject, getProject, project }
