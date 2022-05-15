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
      const { text } = await get(page, '/')
      expect(text).toContain('Hello, middleware!')
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

      const { text } = await get(page, '/')
      expect(text).toContain('B')
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
      const { text } = await get(page, '/')
      expect(text).toContain('B')
    },
  )
})

test.only('HMR does not affect overriding', async ({ page }) => {
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
      try {
        console.log('A')
        await writeFile('a/server/middleware/hello.js', `export default (req, res) => res.send('C')`)
        console.log('B')

        const { text } = await get(page, '/')
        console.log('C')
        expect(text).toContain('B')
        console.log('B')
      } catch (e) {
        console.error(e)
        expect(true).toBe(false)
      }
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

      const { text } = await get(page, '/')
      expect(text).toContain('C')
    },
  )
})
