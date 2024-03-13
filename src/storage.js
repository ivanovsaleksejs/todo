const readData = (name, def = null) => JSON.parse(localStorage.getItem(name)) ?? def

const saveData = (name, value) => localStorage.setItem(name, JSON.stringify(value))

export { readData, saveData }
