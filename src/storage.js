import Element from './element.js'
import state from './state.js'

class Export extends Element
{
  name = "a"

  props = {
    download: "localStorageData.json"
  }

  constructor()
  {
    super()

    this.url = URL.createObjectURL(
      new Blob([JSON.stringify(localStorage)], { type: "application/json" })
    )
    this.props.href = this.url;
    this.toNode()
  }

  postRender = {
    click: _ => {
      this.node.click()
      URL.revokeObjectURL(this.url)
      this.node.remove()
    }
  }
}

class Import extends Element {
  name = "form"

  children = {
    input: {
      props: {
        type: "file"
      },
      postRender: {
        click: _ => {
          this.input.node.click()
        }
      },
      listeners: {
        change: e => {
          this.upload(e)
        }
      }
    }
  }

  upload = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.addEventListener('load', _ => {
        const data = JSON.parse(reader.result)
        for (let prop in data) {
          localStorage.setItem(prop, data[prop])
        }
        state.todo.workspace.selector.prepareNode(true)
        state.todo.project.selector.prepareNode(true)
        state.todo.todoblocks.prepareNode(true)
      })
      reader.readAsText(file)
    }
  }

  constructor()
  {
    super()
    this.prepareNode()
  }
}

const importData = _ => new Import

const exportData = _ => new Export

const readData = (name, def = null) => JSON.parse(localStorage.getItem(name)) ?? def

const saveData = (name, value) => localStorage.setItem(name, JSON.stringify(value))

export { readData, saveData, exportData, importData }
