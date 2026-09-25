import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { buildElectron } from './build-electron.mts'

const root = path.resolve(import.meta.dirname, '..')
const devServerUrl = process.env.LIVETR_DEV_SERVER_URL || 'http://localhost:3001'
// Node.js'te `require('electron')` Electron'un çalıştırılabilir dosya yolunu döner.
const electronPath = createRequire(import.meta.url)('electron') as string

async function waitForDevServer(timeoutMs = 60000): Promise<boolean> {
  const startedAt = Date.now()
  let notified = false

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(devServerUrl)
      if (response.ok) {
        return true
      }
    } catch (_error) {}

    if (!notified) {
      console.log(`Waiting for the development server at ${devServerUrl} (npm run dev)...`)
      notified = true
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return false
}

await buildElectron()

if (!(await waitForDevServer())) {
  console.error(`Development server is not reachable: ${devServerUrl}`)
  process.exit(1)
}

const electronProcess = spawn(electronPath, ['.', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_MODE: 'development',
  },
})

electronProcess.on('exit', (code) => {
  if (code) {
    console.error(`Electron process exited with code ${code}`)
  }

  process.exit(code ?? 0)
})

process.on('SIGINT', () => {
  electronProcess.kill('SIGINT')
})
