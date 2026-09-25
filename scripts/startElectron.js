import path from 'node:path'
import { spawn } from 'node:child_process'
import electronPath from 'electron'

/**
 * Geliştirme ortamında Electron'u Vite geliştirme sunucusuna bağlı olarak başlatır.
 * `npm run dev` ile sunucu açılana kadar bekler; iki komut herhangi bir sırayla çalıştırılabilir.
 */
const root = path.resolve(import.meta.dirname, '..')
const devServerUrl = process.env.LIVETR_DEV_SERVER_URL || 'http://localhost:3001'

async function waitForDevServer(timeoutMs = 60000) {
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

if (!(await waitForDevServer())) {
  console.error(`Development server is not reachable: ${devServerUrl}`)
  process.exit(1)
}

// `npm run electron -- <argümanlar>` ile verilen ek argümanlar Electron'a iletilir.
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

// ctrl+c ile durdurma işlemini yakalar.
process.on('SIGINT', () => {
  electronProcess.kill('SIGINT')
})
