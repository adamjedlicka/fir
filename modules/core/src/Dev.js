import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {} from 'node:crypto'
import express from 'express'
import { createServer } from 'vite'
import Youch from 'youch'
import chokidar from 'chokidar'
import { Fir } from './Fir.js'

export class Dev extends Fir {
  async createServer() {
    const config = this.buildConfig({
      server: { middlewareMode: true },
      clearScreen: false,
      root: this.firDir,
      logLevel: process.env.NODE_ENV === 'test' ? 'silent' : undefined,
    })

    const viteDevServer = await createServer(config)

    const server = express()

    server.use(viteDevServer.middlewares)

    await this._loadMiddleware(server)

    server.get('*', async (req, res, next) => {
      try {
        const url = req.originalUrl

        const index = await readFile(join(this.firDir, 'index.html'), { encoding: 'utf-8' })
        const template = await viteDevServer.transformIndexHtml(url, index)

        const { default: entry } = await viteDevServer.ssrLoadModule('/entry.server.ts')

        return await this.handleRequest({
          entry,
          req,
          res,
          template,
        })
      } catch (e) {
        viteDevServer.ssrFixStacktrace(e)

        if (process.env.NODE_ENV === 'test') {
          next(e)
        } else {
          const youch = new Youch(e, req)

          const html = await youch.toHTML()

          res.status(500).end(html)
        }

        viteDevServer.restart()
      }
    })

    this.onClose(async () => {
      await viteDevServer.close()
    })

    return server
  }

  async _loadMiddleware(server) {
    const router = express.Router()

    const path = join(this.firDir, 'server', 'middleware.js')

    for (const middleware of Object.values(await import(path))) {
      router.use(middleware)
    }

    const watcher = chokidar.watch(path)

    watcher.on('change', async () => {
      router.stack.splice(0)

      for (const middleware of Object.values(await import(path + '?hash=' + Math.random().toString().slice(2)))) {
        router.use(middleware)
      }
    })

    server.use(router)
  }
}
