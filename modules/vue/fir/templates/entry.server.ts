import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
// @ts-ignore
import App from './App.vue'
// @ts-ignore
import * as plugins from './plugins'

export default async (ctx) => {
  const app = createSSRApp(App)

  for (const plugin of Object.values(plugins) as any) {
    await plugin.default(app, ctx)
  }

  const html = await renderToString(app, ctx)

  for (const plugin of Object.values(plugins) as any) {
    if (plugin.after) {
      await plugin.after(app, ctx)
    }
  }

  return {
    html,
  }
}
