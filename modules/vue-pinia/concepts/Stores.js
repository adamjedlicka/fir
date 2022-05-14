import { GeneratingConcept } from '@fir-js/core'

export default class Stores extends GeneratingConcept {
  get directory() {
    return 'stores'
  }

  get exportAll() {
    return true
  }
}
