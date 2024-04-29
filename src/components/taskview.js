import { form, formRow } from './form.js'
import Popup from './popup.js'
import CommitList from './commitlist.js'
import Element   from '../element.js'
import state     from '../state.js'

class TaskView extends Element
{
  name = "taskview"

  constructor(id, task)
  {
    super()

    this.id = id
    this.task = task
    this.children = {
      header: {
        children: {
          taskname: { props: { innerText: `${task.code} ${task.name}` } },
          options: {
            children: {
              edit: {
                listeners: {
                  click: e => new Popup(state.todo.tasks.addTaskForm(this.task.todoList, this.id, this.task))
                }
              },
              delete: {
                listeners: {
                  click: e => new Popup(state.todo.tasks.deleteTaskForm(this.id, this.task))
                }
              }
            }
          },
        }
      },
      description: { props: { innerText: task.description } },
      commits: {
        name: "fieldset",
        props: { className: "commits" },
        children: { legend: { props: { innerText: "Commits" } } }
      },
      done: formRow("Completed", {
        name: "input",
        props: { name: "done", type: "checkbox", checked: task.closed },
        listeners: {
          click: e => this.closeTask(e.target.checked)
        }
      }),
      active: formRow("Active", {
        name: "input",
        props: { name: "active", type: "checkbox", checked: task.active },
        listeners: {
          click: e => this.setActive(e.target.checked)
        }
      })
    }
  }

  postRender = {
    fetchCommits: _ => this.fetchCommits().then(
      commits => (new CommitList(commits)).appendTo(this.commits)
    )
  }

  async fetchCommits()
  {
    if (!this.task.repo) {
      return []
    }
    const apiUrl = `https://api.github.com/repos/${this.task.repo}/commits`

    const response = await fetch(apiUrl)
    const commits = await response.json()

    const filteredCommits = commits.filter(commit => commit.commit.message.includes(this.task.code))

    return filteredCommits.map(commit => ({
      author: commit.commit.committer.name,
      date: new Date(commit.commit.committer.date).toLocaleString("lv-LV", { day: "2-digit", month: "2-digit", year: "numeric", hour:"2-digit", minute:"2-digit", second:"2-digit" }),
      message: commit.commit.message,
      url: commit.html_url,
      sha: commit.sha
    }))
  }

  closeTask = checked =>
  {
    const tasks = state.todo.tasks.list
    tasks[this.id].closed = checked
    state.todo.tasks.list = tasks
    state.popup.close()
  }

  setActive = checked =>
  {
    const activeTasks = state.todo.tasks.activeTasks
    activeTasks[this.task.project] = checked ? this.id : null
    state.todo.tasks.activeTasks = activeTasks
    state.popup.close()
  }
}

export default TaskView
