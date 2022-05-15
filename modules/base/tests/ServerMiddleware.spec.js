import { test, expect } from '@playwright/test'
import { makeProject } from '@fir-js/testing'

test('Basic middleware', async ({ page }) => {
  await makeProject(
    {
      packages: [
        '@fir-js/base',
        [
          'app',
          {
            server: {
              middleware: {
                'hello.js': `export default (req, res) => res.send('Hello, middleware!')`,
              },
            },
          },
        ],
      ],
    },
    async ({ get }) => {
      await get(page, '/')
      expect(await page.content()).toContain('Hello, middleware!')
    },
  )
})

test('HMR', async ({ page }) => {
  await makeProject(
    {
      packages: [
        '@fir-js/base',
        [
          'a',
          {
            server: {
              middleware: {
                'hello.js': `export default (req, res) => res.send('A')`,
              },
            },
          },
        ],
      ],
    },
    async ({ get, writeFile }) => {
      await writeFile('a/server/middleware/hello.js', `export default (req, res) => res.send('B')`)

      await get(page, '/')
      expect(await page.content()).toContain('B')
    },
  )
})

test('Overriding', async ({ page }) => {
  await makeProject(
    {
      packages: [
        '@fir-js/base',
        [
          'a',
          {
            server: {
              middleware: {
                'hello.js': `export default (req, res) => res.send('A')`,
              },
            },
          },
        ],
        [
          'b',
          {
            server: {
              middleware: {
                'hello.js': `export default (req, res) => res.send('B')`,
              },
            },
          },
        ],
      ],
    },
    async ({ get }) => {
      await get(page, '/')
      expect(await page.content()).toContain('B')
    },
  )
})

test('HMR does not affect overriding', async ({ page }) => {
  await makeProject(
    {
      packages: [
        '@fir-js/base',
        [
          'a',
          {
            server: {
              middleware: {
                'empty.js': `export default (req, res, next) => next()`,
              },
            },
          },
        ],
        [
          'b',
          {
            server: {
              middleware: {
                'hello.js': `export default (req, res) => res.send('B')`,
              },
            },
          },
        ],
      ],
    },
    async ({ get, writeFile }) => {
      await writeFile('a/server/middleware/hello.js', `export default (req, res) => res.send('C')`)

      await get(page, '/')
      expect(await page.content()).toContain('B')
    },
  )
})

test('HMR can affect overriding', async ({ page }) => {
  await makeProject(
    {
      packages: [
        '@fir-js/base',
        [
          'a',
          {
            server: {
              middleware: {
                'hello.js': `export default (req, res) => res.send('A')`,
              },
            },
          },
        ],
        [
          'b',
          {
            server: {
              middleware: {
                'empty.js': `export default (req, res, next) => next()`,
              },
            },
          },
        ],
      ],
    },
    async ({ get, writeFile }) => {
      await writeFile('b/server/middleware/hello.js', `export default (req, res) => res.send('C')`)

      await get(page, '/')
      expect(await page.content()).toContain('C')
    },
  )
})
