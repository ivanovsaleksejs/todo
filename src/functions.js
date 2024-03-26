const randomUUID = _ => [...Array(20)].map(_ => (Math.random()*16|0).toString(16)).join("")

export { randomUUID }
