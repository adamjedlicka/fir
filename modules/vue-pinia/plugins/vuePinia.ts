import type { App } from 'vue'
import { createPinia } from 'pinia'

export default async (app: App, ctx: any) => {
  const pinia = createPinia()

  app.use(pinia)

  //@ts-ignore
  if (import.meta.env.SSR) {
    ctx.pinia = pinia
  } else {
    //@ts-ignore
    pinia.state.value = window.$payload.pinia
  }
}

export const after = async (app: App, ctx: any) => {
  //@ts-ignore
  if (!import.meta.env.SSR) return

  ctx.payload.pinia = ctx.pinia.state.value
}
