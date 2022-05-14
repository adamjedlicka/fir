import { test, expect } from '@playwright/test'
import { makeProject } from '@fir-js/testing'

test('it works', async ({ page }) => {
  await makeProject(
    {
      packages: ['@fir-js/base', '@fir-js/vue'],
    },
    async ({ get }) => {
      const { text } = await get(page, '/')
      expect(text).toContain('Hello, Fir!')
      await expect(page.locator('#app')).toContainText('Hello, Fir!')
    },
  )
})

test('it allows overriding App.vue', async ({ page }) => {
  await makeProject(
    {
      packages: [
        '@fir-js/base',
        '@fir-js/vue',
        [
          'app',
          {
            fir: {
              templates: {
                'App.vue': `<template><h1>Hello, App!</h1></template>`,
              },
            },
          },
        ],
      ],
    },
    async ({ get }) => {
      const { text } = await get(page, '/')
      expect(text).toContain('Hello, App!')
      await expect(page.locator('#app')).toContainText('Hello, App!')
    },
  )
})

test('it allows HMR App.vue', async ({ page }) => {
  await makeProject(
    {
      packages: [
        '@fir-js/base',
        '@fir-js/vue',
        [
          'app',
          {
            fir: {
              templates: {
                'App.vue': `<template><h1>Hello, A!</h1></template>`,
              },
            },
          },
        ],
      ],
    },
    async ({ get, writeFile }) => {
      await writeFile('app/fir/templates/App.vue', `<template><h1>Hello, B!</h1></template>`)
      const { text } = await get(page, '/')
      expect(text).toContain('Hello, B!')
      await expect(page.locator('#app')).toContainText('Hello, B!')
    },
  )
})

test.slow('it supports reactivity', async ({ page }) => {
  await makeProject(
    {
      packages: [
        '@fir-js/base',
        '@fir-js/vue',
        [
          'app',
          {
            fir: {
              templates: {
                'App.vue': `
                  <template>
                    <button @click='count++'>{{ count }}</button>
                  </template>
                  <script setup>
                  import { ref } from 'vue'

                  const count = ref(0)
                  </script>`,
              },
            },
          },
        ],
      ],
    },
    async ({ get }) => {
      await get(page, '/')
      await page.locator('button').click()
      await page.locator('button').click()
      await page.locator('button').click()
      await expect(page.locator('button')).toContainText('3')
    },
  )
})
