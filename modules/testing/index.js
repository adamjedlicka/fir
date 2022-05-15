import path from 'node:path'
import fs from 'node:fs/promises'
import getPort from 'get-port'
import chokidar from 'chokidar'
import { Dev } from '@fir-js/core'

export const makeProject = async (config, callback) => {
  await makeTempDir(async (dir) => {
    for (const pkg of config.packages) {
      if (typeof pkg === 'string') continue

      await writePackage(dir, pkg[0], pkg[1])
    }

    const dev = new Dev({
      dir,
      modules: config.packages.map((pkg) => {
        if (typeof pkg === 'string') return pkg

        return `./${pkg[0]}`
      }),
    })

    await dev.bootstrap()

    const app = await dev.createServer()

    const port = await getPort()

    const server = await new Promise((resolve) => {
      const server = app.listen(port, () => {
        resolve(server)
      })
    })

    const url = `http://localhost:${port}`

    await callback({
      app,
      server,
      url,
      writeFile: (_path, _content) => {
        const joined = path.join(dir, _path)

        return new Promise(async (resolve, reject) => {
          try {
            const watcher = chokidar.watch(joined, { ignoreInitial: true }).on('all', async () => {
              setTimeout(() => resolve(), 1000)
              await watcher.close()
              resolve()
            })

            await writeFile(joined, _content)
          } catch (err) {
            reject(err)
          }
        })
      },
      rm: (_path) => fs.rm(path.join(dir, _path), { recursive: true }),
      get: async (page, path) => {
        const location = url + path

        const [response] = await Promise.all([fetch(location), page.goto(location)])

        const text = await response.text()

        return { text }
      },
    })

    await server.close()
    await dev.close()
  })
}

const makeTempDir = async (fn) => {
  const dir = await fs.mkdtemp('.test/temp-')

  await fn(path.join(process.cwd(), dir))
}

const writeFile = async (file, content) => {
  const dir = path.dirname(file)
  if (dir !== '.') await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(file, content, { encoding: 'utf-8' })
}

const writeDirectory = async (dir, structure) => {
  for (const [key, value] of Object.entries(structure)) {
    if (typeof value === 'string') {
      await writeFile(path.join(dir, key), value)
    } else {
      await writeDirectory(path.join(dir, key), value)
    }
  }
}

const writePackage = async (dir, name, structure = {}) => {
  await writeFile(path.join(dir, name, 'package.json'), `{ "name": "${name}", "type": "module" }`)

  await writeDirectory(path.join(dir, name), structure)
}
