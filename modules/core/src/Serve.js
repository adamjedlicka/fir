import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import express from 'express'
import compression from 'compression'
import Youch from 'youch'
import { Fir } from './Fir.js'

export class Serve extends Fir {
  async createServer() {
    const template = await readFile(join(this.distDir, 'client', 'index.html'), { encoding: 'utf-8' })

    const { default: entry } = await import(join(this.distDir, 'server', 'entry.server.js'))

    const server = express()

    server.use(compression())

    server.use('/assets', express.static(join(this.distDir, 'client', 'assets')))

    await this._loadMiddleware(server)

    server.get('*', async (req, res) => {
      try {
        return await this.handleRequest({ entry, template, req, res })
      } catch (e) {
        const youch = new Youch(e, req)

        const html = await youch.toHTML()

        res.status(500).end(html)
      }
    })

    return server
  }

  async _loadMiddleware(server) {
    for (const middleware of Object.values(await import(join(this.firDir, 'server', 'middleware.js')))) {
      server.use(middleware)
    }
  }
}
