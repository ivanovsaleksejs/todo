import element from '/element.js'

const popup = (content, state) =>
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
          state.popup.close()
        }
      }
    },
    ...content
  }
})

const showPopup = (content, state) =>
{
  if (state.popup) {
    state.popup.close()
  }
  state.popup = element(popup(content, state))
  state.popup.appendTo(document.body)
}

export default showPopup
