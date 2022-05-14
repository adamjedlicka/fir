import { CopyingConcept } from '@fir-js/core'

export default class Middleware extends CopyingConcept {
  get directory() {
    return 'fir/templates'
  }

  dst() {
    return this.fir.firDir
  }
}
