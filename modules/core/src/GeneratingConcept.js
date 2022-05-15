import ejs from 'ejs'
import { Dev } from './Dev.js'
import { OverridingConcept } from './OverridingConcept.js'

export class GeneratingConcept extends OverridingConcept {
  async before() {
    await super.before()

    this.compiledTemplate = ejs.compile(this.template)
  }

  async execute(files) {
    const records = {}

    for (const { module, file } of Object.values(files)) {
      const ident = file.replace(/\..+$/, '')

      records[ident] = this.getRelativePathForFile(module, file)

      if (this.fir instanceof Dev) {
        records[ident] += `?hash=${await this.getHashForFile(module, file)}`
      }
    }

    await this.renderTemplate(this.compiledTemplate, { records })
  }

  get template() {
    return `
<%_ for (const [ident, path] of Object.entries(records)) { _%>
export ${this.exportAll ? '* as <%= ident %>' : '{ default as <%= ident %> }'} from '<%= path %>'
<%_ } _%>
`
  }

  get exportAll() {
    return false
  }
}
