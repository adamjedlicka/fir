import { join } from 'node:path'
import { mkdir, copyFile } from 'node:fs/promises'
import { OverridingConcept } from './OverridingConcept.js'

export class CopyingConcept extends OverridingConcept {
  async before() {
    await super.before()

    await mkdir(this.dst(), { recursive: true })
  }

  async execute(files) {
    for (const { module, file } of Object.values(files)) {
      await copyFile(join(this.src(module), file), join(this.dst(), file))
    }
  }

  get executesOnChanges() {
    return true
  }
}
