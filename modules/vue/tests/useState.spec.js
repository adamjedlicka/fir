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
                  <div>{{ count }}</div>
                </template>
                <script setup lang='ts'>
                // TODO: Import
                import { useState } from '@fir-js/vue/index';

                const count = useState('count')

                if (import.meta.env.SSR) count.value = 1
                </script>
              `,
            },
          },
        ],
      ],
    },
    async ({ url }) => {
      await page.goto(url)
      await expect(page.locator('#app')).toContainText('1')
    },
  )
})

test('it is reactive', async ({ page }) => {
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
                  <button @click="count++">{{ count }}</button>
                </template>
                <script setup lang='ts'>
                // TODO: Import
                import { useState } from '@fir-js/vue/index';

                const count = useState('count', () => 0)
                </script>
              `,
            },
          },
        ],
      ],
    },
    async ({ url }) => {
      await page.goto(url)
      await page.locator('button').click()
      await expect(page.locator('#app')).toContainText('1')
    },
  )
})
