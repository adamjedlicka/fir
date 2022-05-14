import { readdir, mkdir } from 'node:fs/promises'
import { basename, join, dirname } from 'node:path'
import chokidar from 'chokidar'
import { Concept } from './Concept.js'
import { Dev } from './Dev.js'

export class OverridingConcept extends Concept {
  async before() {
    this._modules = []
    this._watchers = []

    await mkdir(join(this.fir.firDir, dirname(this.directory)), { recursive: true })
  }

  async run(module) {
    const _module = {
      module,
      files: new Set(),
    }

    this._modules.push(_module)

    try {
      const files = await readdir(this.src(module))

      for (const file of files) {
        _module.files.add(file)
      }
    } catch {
      // Do nothing...
    }

    if (this.fir instanceof Dev) {
      this._watchers.push(() => this._watch(_module))
    }
  }

  async after() {
    await this.execute(this._getFiles())

    for (const watcher of this._watchers) {
      await watcher()
    }
  }

  async execute(files) {
    throw new Error('"execute" method not implemented')
  }

  get executesOnChanges() {
    return false
  }

  src(module) {
    return join(module.path, this.directory)
  }

  dst() {
    return join(this.fir.firDir, this.directory)
  }

  _getFiles() {
    const files = {}

    for (const module of this._modules) {
      for (const file of module.files) {
        files[file] = {
          module: module.module,
          file,
        }
      }
    }

    return files
  }

  _watch({ module, files }) {
    const watcher = chokidar.watch(module.joinPath(this.directory), {
      ignoreInitial: true,
    })

    watcher
      .on('add', async (path) => {
        const file = this._normalizePath(path)

        files.add(file)

        await this.execute(this._getFiles())
      })
      .on('unlink', async (path) => {
        const file = this._normalizePath(path)

        files.delete(file)

        await this.execute(this._getFiles())
      })

    if (this.executesOnChanges) {
      watcher.on('change', async (path) => {
        const file = this._normalizePath(path)

        await this.execute([{ module, file }])
      })
    }
  }

  _normalizePath(path) {
    return basename(path)
  }
}
