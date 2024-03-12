import element from '../element.js'
import state   from '../state.js'

const popup = content =>
({
  name: "popup",
  close: _ => {
    state.popup.node.remove()
    delete state.popup
  },
  children: {
    closebutton: {
      listeners: {
        click: e => {
          e.target.component.parent.close()
        }
      }
    },
    ...content
  }
})

const showPopup = (content) =>
{
  if (state.popup) {
    state.popup.close()
  }
  state.popup = element(popup(content))
  state.popup.appendTo(document.body)
}

export default showPopup
