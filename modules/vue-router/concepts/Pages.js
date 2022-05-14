import { parse } from 'node:path'
import { GeneratingConcept } from '@fir-js/core'

export default class Pages extends GeneratingConcept {
  get directory() {
    return 'pages'
  }

  async execute(files) {
    const routes = []

    for (const { module, file } of Object.values(files)) {
      const parsed = parse(file)
      const parts = [...parsed.dir.split('/').filter(Boolean), parsed.name]
      const component = this.getRelativePathForFile(module, file)

      routes.push({
        ident: this.getIdent(parts),
        path: this.getPath(parts),
        priority: this.getPriority(parts),
        component,
      })
    }

    const pages = routes
      .filter((file) => file.ident !== '$layout')
      .sort((a, b) => {
        return a.priority - b.priority
      })

    const layout = routes.find((file) => file.ident === '$layout')

    await this.renderTemplate(this.compiledTemplate, { pages, layout })
  }

  getIdent(parts) {
    return parts.join('_')
  }

  getPath(parts) {
    if (parts[0] === 'index') return '/'
    if (parts[0] === '$404') return '/:pathMatch(.*)*'

    const route = parts.map((part) => part.replace(/\[(.+?)\]/g, (_, $1) => `:${$1}(.+)`)).join('/')

    return `/${route}`
  }

  getPriority(parts) {
    if (parts[0] === 'index') return 1
    if (parts[0] === '$404') return 9001

    let priority = 10

    for (let part of parts) {
      if (part[0] === '_') {
        priority += 20
      } else {
        priority += 10
      }
    }

    return priority
  }

  get template() {
    return `
export { default as Layout } from '<%- layout.component -%>'
    
export const routes = [
<%_ for (const page of pages) { _%>
  { path: '<%= page.path %>', component: () => import('<%= page.component %>'), },
<%_ } _%>
]
`
  }
}
