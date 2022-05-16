import path from 'node:path'
import fs from 'node:fs/promises'
import getPort from 'get-port'
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
      vite: {
        server: {
          hmr: {
            port: await getPort(),
          },
        },
      },
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
      url,
      writeFile: (_path, _content) => writeFile(path.join(dir, _path), _content),
      rm: (_path) => fs.rm(path.join(dir, _path), { recursive: true }),
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
