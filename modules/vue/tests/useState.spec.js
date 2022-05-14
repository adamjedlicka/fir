import { test, expect } from '@playwright/test'
import { makeProject } from '@fir-js/testing'

test('it transfers state', async ({ page }) => {
  await makeProject(
    {
      packages: [
        '@fir-js/base',
        '@fir-js/vue',
        '@fir-js/vue-router',
        [
          'app',
          {
            pages: {
              'index.vue': `
                <template>
                  <div>{{ 1 }}</div>
                </template>
                <script setup lang='ts'>
                // TODO: Import
                import { useState } from '@fir-js/vue/index';

                const count = useState('count', () => Math.round(Math.random() * 1000))
                </script>
              `,
            },
          },
        ],
      ],
    },
    async ({ get }) => {
      const { text } = await get(page, '/')
      await expect(page.locator('#app')).toContainText(text.match(/<div>(.+?)<\/div>/)[1])
    },
  )
})