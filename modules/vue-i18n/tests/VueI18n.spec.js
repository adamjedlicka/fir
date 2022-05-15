import { test, expect } from '@playwright/test'
import { makeProject } from '@fir-js/testing'

test('it works', async ({ page }) => {
  await makeProject(
    {
      packages: [
        '@fir-js/base',
        '@fir-js/vue',
        '@fir-js/vue-router',
        '@fir-js/vue-i18n',
        [
          'app',
          {
            pages: {
              'index.vue': `
                <template>
                  <h1>{{ t('greet') }}</h1>
                </template>
                <script setup>
                import { useI18n } from 'vue-i18n'

                const { t } = useI18n()
                </script>
                <i18n lang="yaml">
                en:
                  greet: Hello, I18N!
                </i18n>
              `,
            },
          },
        ],
      ],
    },
    async ({ url }) => {
      await page.goto(url)
      await expect(page.locator('#app')).toHaveText('Hello, I18N!')
    },
  )
})
