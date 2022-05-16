import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig, mergeConfig } from 'vite'
import nodeFetch from 'node-fetch'
import devalue from 'devalue'
import { Module } from './Module.js'

global.fetch = nodeFetch

export class Fir {
  constructor(firConfig = {}) {
    this.firConfig = firConfig

    this.viteConfig = mergeConfig(
      defineConfig({
        cacheDir: join(this.firDir, '.vite'),
      }),
      firConfig.vite ?? {},
    )

    this.closeHandlers = []

    /** @type {Module[]} */
    this.modules = []

    /** @type {Concept[]} */
    this.concepts = []
  }

  async bootstrap() {
    await this.clearFirDir()

    await this.loadModules()

    await this.loadConcepts()

    for (const concept of this.concepts) {
      await concept.before()

      for (const pkg of this.modules) {
        await concept.run(pkg)
      }

      await concept.after()
    }
  }

  async handleRequest({ entry, template, req, res }) {
    const ctx = {
      req,
      res,
      payload: {},
    }

    const response = await entry(ctx)

    for (const [key, value] of Object.entries(response)) {
      template = template.replace(`<!--${key}-->`, value)
    }

    template = template.replace('<!--payload-->', devalue(ctx.payload))

    res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
  }

  buildConfig(viteConfig) {
    return mergeConfig(this.viteConfig, viteConfig, true)
  }

  async loadModules() {
    for (const ident of this.firConfig.modules) {
      const module = new Module(this, {
        name: ident,
      })

      if (process.env.NODE_ENV !== 'test') console.log('Loaded module', module.name)

      this.viteConfig = mergeConfig(this.viteConfig, await module.getViteConfig())

      this.modules.push(module)
    }
  }

  async loadConcepts() {
    for (const module of this.modules) {
      this.concepts.push(...(await module.getConcepts()))
    }
  }

  async clearFirDir() {
    await rm(this.firDir, { recursive: true, force: true })
  }

  async close() {
    for (const closeHandler of this.closeHandlers) {
      await closeHandler()
    }
  }

  onClose(closeHandler) {
    this.closeHandlers.push(closeHandler)
  }

  get rootDir() {
    return this.firConfig.dir ?? process.cwd()
  }

  get firDir() {
    return join(this.rootDir, '.fir')
  }

  get distDir() {
    return join(this.firDir, 'dist')
  }
}
