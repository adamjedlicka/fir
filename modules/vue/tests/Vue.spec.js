import { test, expect } from '@playwright/test'
import { makeProject } from '@fir-js/testing'

test('it works', async ({ page }) => {
  await makeProject(
    {
      packages: ['@fir-js/base', '@fir-js/vue'],
    },
    async ({ url }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
      await expect(await page.content()).toContain('Hello, Fir!')
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
    async ({ url }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
      await expect(await page.content()).toContain('Hello, App!')
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
    async ({ url, writeFile }) => {
      await writeFile('app/fir/templates/App.vue', `<template><h1>Hello, B!</h1></template>`)
      await page.goto(url, { waitUntil: 'networkidle' })
      await expect(await page.content()).toContain('Hello, B!')
    },
  )
})

test('it supports reactivity', async ({ page }) => {
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
    async ({ url }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.locator('button').click()
      await page.locator('button').click()
      await page.locator('button').click()
      await expect(page.locator('button')).toContainText('3')
    },
  )
})
