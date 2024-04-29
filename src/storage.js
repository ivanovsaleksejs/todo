import Element from './element.js'

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

const exportData = _ => new Export

const readData = (name, def = null) => JSON.parse(localStorage.getItem(name)) ?? def

const saveData = (name, value) => localStorage.setItem(name, JSON.stringify(value))

export { readData, saveData, exportData }
