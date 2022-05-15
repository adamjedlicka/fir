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
    async ({ url }) => {
      await page.goto(url + '/')
      await expect(await page.content()).toContain('Hello from home!')
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
    async ({ url }) => {
      await page.goto(url + '/a')
      await expect(await page.content()).toContain('Page A')
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
    async ({ url }) => {
      await page.goto(url + '/')
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
    async ({ url }) => {
      await page.goto(url + '/a')
      await expect(await page.content()).toContain('Layout')
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
    async ({ url }) => {
      await page.goto(url + '/a')
      await expect(await page.content()).toContain('Error page')
    },
  )
})
