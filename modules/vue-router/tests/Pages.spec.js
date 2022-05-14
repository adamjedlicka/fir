import { expect, test } from '@playwright/test'
import { makeProject } from '@fir-js/testing'

test('it works', async ({ page }) => {
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
              'index.vue': `<template><h1>Hello from home!</h1></template>`,
            },
          },
        ],
      ],
    },
    async ({ get }) => {
      const expected = 'Hello from home!'
      const { text } = await get(page, '/')
      expect(text).toContain(expected)
      await expect(page.locator('h1')).toContainText(expected)
    },
  )
})

test('it SSR pages', async ({ page }) => {
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
              'index.vue': `<template><h1>Hello from home!</h1></template>`,
              'a.vue': `<template><h1>Page A</h1></template>`,
            },
          },
        ],
      ],
    },
    async ({ get }) => {
      const expected = 'Page A'
      const { text } = await get(page, '/a')
      expect(text).toContain(expected)
      await expect(page.locator('h1')).toContainText(expected)
    },
  )
})

test('it allows navigating between pages', async ({ page }) => {
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
              'index.vue': `<template><h1>Page index</h1><RouterLink id='a' to='/a'>A</RouterLink></template>`,
              'a.vue': `<template><h1>Page A</h1></template>`,
            },
          },
        ],
      ],
    },
    async ({ get }) => {
      const { text } = await get(page, '/')
      expect(text).toContain('Page index')
      await expect(page.locator('h1')).toContainText('Page index')
      await page.locator('#a').click()
      await expect(page.locator('h1')).toContainText('Page A')
    },
  )
})

test('it supports layouts', async ({ page }) => {
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
              'a.vue': `<template><h2>Page A</h2></template>`,
              '$layout.vue': `<template><h1>Layout</h1><slot /></template>`,
            },
          },
        ],
      ],
    },
    async ({ get }) => {
      const expected = 'Layout'
      const { text } = await get(page, '/a')
      expect(text).toContain(expected)
      await expect(page.locator('h1')).toContainText(expected)
    },
  )
})

test('it supports 404', async ({ page }) => {
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
              'index.vue': `<template><h1>Hello from home!</h1></template>`,
              '$404.vue': `<template><h1>Error page</h1><slot /></template>`,
            },
          },
        ],
      ],
    },
    async ({ get }) => {
      const expected = 'Error page'
      const { text } = await get(page, '/a')
      expect(text).toContain(expected)
      await expect(page.locator('h1')).toContainText(expected)
    },
  )
})
