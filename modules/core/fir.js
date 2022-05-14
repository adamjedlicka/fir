import { join } from 'node:path'
import minimist from 'minimist'
import { Dev } from './src/Dev.js'
import { Build } from './src/Build.js'
import { Serve } from './src/Serve.js'

const argv = minimist(process.argv.slice(2))

const main = async () => {
  const cmd = argv._[0]

  const host = argv.host ?? 'localhost'
  const port = argv.port ?? '3000'

  const { default: firConfig } = await import(join(process.cwd(), 'fir.config.js'))

  if (cmd === 'dev') {
    const dev = new Dev(firConfig)
    await dev.bootstrap()
    const server = await dev.createServer()
    server.listen(port, () => console.log(`Server listening on http://${host}:${port}`))
  } else if (cmd === 'build') {
    const build = new Build(firConfig)
    await build.bootstrap()
    await build.build()
  } else if (cmd === 'serve') {
    const serve = new Serve(firConfig)
    const server = await serve.createServer()
    server.listen(port, () => console.log(`Server listening on http://${host}:${port}`))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
