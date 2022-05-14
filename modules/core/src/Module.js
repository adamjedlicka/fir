import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export class Module {
  constructor(fir, meta) {
    this.fir = fir
    this.meta = meta
  }

  async getConcepts() {
    const concepts = []

    let idents = []

    try {
      idents = await readdir(join(this.path, 'concepts'))
    } catch {
      // Do nothing...
    }

    for (const ident of idents) {
      const { default: Concept } = await import(join(this.path, 'concepts', ident))

      const concept = new Concept(this.fir)

      if (process.env.NODE_ENV !== 'test') console.log('Loaded concept', concept.directory)

      concepts.push(concept)
    }

    return concepts
  }

  async getViteConfig() {
    try {
      const { default: viteConfig } = await import(this.joinPath('vite.config.js'))

      return viteConfig
    } catch {
      return {}
    }
  }

  get name() {
    return this.meta.name
  }

  get path() {
    if (this.meta.name.startsWith('.')) {
      return dirname(require.resolve(join(this.fir.rootDir, this.meta.name, 'package.json')))
    } else {
      return dirname(require.resolve(join(this.meta.name, 'package.json')))
    }
  }

  joinPath(...parts) {
    return join(this.path, ...parts)
  }
}
