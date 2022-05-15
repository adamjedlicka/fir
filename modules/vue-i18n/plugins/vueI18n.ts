import type { App } from 'vue'
import { createI18n } from 'vue-i18n'

export default (app: App) => {
  const i18n = createI18n({
    legacy: false,
    fallbackFormat: true,
    missingWarn: false,
    fallbackWarn: false,
  })

  app.use(i18n)
}
