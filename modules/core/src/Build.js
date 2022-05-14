import { join } from 'node:path'
import { build } from 'vite'
import open from 'open'
import { visualizer } from 'rollup-plugin-visualizer'
import { Fir } from './Fir.js'

export class Build extends Fir {
  async build() {
    const analyze = process.argv.includes('--analyze')

    await build(
      this.buildConfig({
        clearScreen: false,
        root: this.firDir,
        build: {
          ssrManifest: true,
          outDir: join(this.distDir, 'client'),
          emptyOutDir: true,
          rollupOptions: {
            plugins: [
              analyze &&
                visualizer({
                  filename: join(this.distDir, 'client', 'stats.html'),
                }),
            ],
          },
        },
      }),
    )

    if (analyze) {
      open(join(this.distDir, 'client', 'stats.html'))
    }

    await build(
      this.buildConfig({
        clearScreen: false,
        root: this.firDir,
        build: {
          ssr: 'entry.server',
          outDir: join(this.distDir, 'server'),
          emptyOutDir: false,
        },
      }),
    )
  }
}
