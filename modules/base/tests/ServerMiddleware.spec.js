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
    async ({ url }) => {
      await page.goto(url + '/')
      await expect(await page.content()).toContain('Hello, middleware!')
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
    async ({ url, writeFile }) => {
      await writeFile('a/server/middleware/hello.js', `export default (req, res) => res.send('B')`)

      await expect
        .poll(async () => {
          const response = await page.request.get(url + '/')
          return await response.text()
        })
        .toContain('B')
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
    async ({ url }) => {
      await page.goto(url + '/')
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
    async ({ url, writeFile }) => {
      await writeFile('a/server/middleware/hello.js', `export default (req, res) => res.send('C')`)

      await expect
        .poll(async () => {
          const response = await page.request.get(url + '/')
          return await response.text()
        })
        .toContain('B')
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
    async ({ url, writeFile }) => {
      await writeFile('b/server/middleware/hello.js', `export default (req, res) => res.send('C')`)

      await expect
        .poll(async () => {
          const response = await page.request.get(url + '/')
          return await response.text()
        })
        .toContain('C')
    },
  )
})

test('removing files works with HMR', async ({ page }) => {
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
    async ({ url, writeFile, rm }) => {
      await writeFile('b/server/middleware/hello.js', `export default (req, res) => res.send('C')`)

      await expect
        .poll(async () => {
          const response = await page.request.get(url + '/')
          return await response.text()
        })
        .toContain('C')

      await rm('b/server/middleware/hello.js')

      await expect
        .poll(async () => {
          const response = await page.request.get(url + '/')
          return await response.text()
        })
        .toContain('A')
    },
  )
})
