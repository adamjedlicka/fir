import { dirname, join, relative } from 'node:path'
import { writeFile, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

export class Concept {
  constructor(fir) {
    this.fir = fir
  }

  get directory() {
    throw new Error('Unimplemented')
  }

  async before() {}

  async run(pkg) {}

  async after() {}

  getRelativePathForFile(module, file) {
    return relative(join(this.fir.firDir, dirname(this.directory)), module.joinPath(this.directory, file))
  }

  async getHashForFile(module, file) {
    const content = await readFile(module.joinPath(this.directory, file), { encoding: 'utf-8' })

    return createHash('md5').update(content).digest('hex').toString()
  }

  async renderTemplate(template, data) {
    const rendered = template(data)

    await writeFile(join(this.fir.firDir, `${this.directory}.js`), rendered, { encoding: 'utf-8' })
  }
}
