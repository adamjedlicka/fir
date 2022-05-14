import { GeneratingConcept } from '@fir-js/core'

export default class Plugins extends GeneratingConcept {
  get directory() {
    return 'plugins'
  }

  get exportAll() {
    return true
  }
}
