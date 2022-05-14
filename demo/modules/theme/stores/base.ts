import { defineStore } from 'pinia'

export const useStore = defineStore('base', {
  state: () => ({
    count: 0,
  }),

  actions: {
    increment() {
      this.count++
    },
  },
})

export const serverInit = async () => {
  return {
    count: 100,
  }
}
