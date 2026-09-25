import { build, type BuildOptions } from 'esbuild'
import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const outDir = path.join(root, 'dist-electron')

const common: BuildOptions = {
  absWorkingDir: root,
  bundle: true,
  platform: 'node',
  target: 'node24',
  packages: 'external',
  logLevel: 'warning',
}

export async function buildElectron(): Promise<void> {
  await fs.rm(outDir, { recursive: true, force: true })
  await Promise.all([
    build({ ...common, entryPoints: ['electron/main.mts'], outfile: 'dist-electron/main.mjs', format: 'esm' }),
    // Sandbox'lı pencerede preload ES modülü olamaz.
    build({ ...common, entryPoints: ['electron/preload.mts'], outfile: 'dist-electron/preload.cjs', format: 'cjs' }),
  ])
  await fs.copyFile(path.join(root, 'electron/splash.html'), path.join(outDir, 'splash.html'))
}

if (process.argv[1] && path.resolve(process.argv[1]) == import.meta.filename) {
  await buildElectron()
  console.log('Electron build completed: dist-electron')
}
