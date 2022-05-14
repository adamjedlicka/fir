import type { App } from 'vue'
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
// @ts-ignore
import { routes } from '/pages'

export default async (app: App, ctx: any) => {
  const router = createRouter({
    // @ts-ignore
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  })

  // @ts-ignore
  if (import.meta.env.SSR) {
    router.push(ctx.req.url)
  } else {
    // @ts-ignore
    router.push(window.location.pathname)
  }

  await router.isReady()

  app.use(router)
}
