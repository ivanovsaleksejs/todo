import Element   from '../element.js'
import state     from '../state.js'

class Commit extends Element
{
  constructor(commit)
  {
    super()
    this.children =  {
      author: { props: { innerText: `Author: ${commit.author}` } },
      date: { props: { innerText: `Date: ${commit.date}` } },
      message: { props: { innerText: `Commit message: ${commit.message}` } },
      url: { 
        children: {
          span: { props: { innerText: "Commit: " } },
          a: {
            props: {
              href: commit.url,
              innerText: commit.sha.slice(0, 7),
              target: "_blank"
            }
          } 
        }
      }
    } 
  }
}

class CommitList extends Element
{
  constructor(commitList)
  {
    super()
    this.children = this.list(commitList)
  }

  list = commitList => Object.assign({}, commitList.map(commit => new Commit(commit)))
}

export default CommitList
