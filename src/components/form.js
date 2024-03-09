const form = (legend, content, props) =>
({
  form: {
    children: {
      fieldset: {
        children: {
          legend: { props: { innerText: legend } },
          ...content
        }
      }
    },
    ...props
  }
})

const formRow = (label, content, props = {}) =>
({
  children: {
    label: { props: { innerText: label } },
    formElement: content
  },
  ...props
})

export { form, formRow }
