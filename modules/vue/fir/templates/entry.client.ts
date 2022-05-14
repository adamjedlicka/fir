import { createSSRApp } from 'vue'
// @ts-ignore
import App from './App.vue'
// @ts-ignore
import * as plugins from './plugins'

const main = async () => {
  const app = createSSRApp(App)

  for (const plugin of Object.values(plugins) as any) {
    await plugin.default(app)
  }

  app.mount('#app')
}

main().catch((err) => {
  console.error(err)
})
