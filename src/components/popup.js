import { Element } from '../element.js'
import state   from '../state.js'

class Popup extends Element
{
  children = {
    closebutton: {
      listeners: {
        click: e => this.close()
      }
    }
  }
  listeners = {
    rendered: e => setTimeout(e => this.node.classList.add('opened'), 5),
    transitionend: e => {
      if (!this.node.classList.contains('opened')) {
        this.node.remove()
      }
      else {
        this.opened = true
      }
    }
  }

  constructor(content)
  {
    super()
    if (state.popup) {
      state.popup.close()
    }
    this.children = content instanceof Element ? {...this.children, content} : {...this.children, ...content}
    state.popup = this
    state.popup.appendTo(document.body)
  }

  close()
  {
    this.node.classList.remove('opened')
    delete state.popup
  }
}

export default Popup
