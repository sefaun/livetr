import path from 'node:path'
import { exec } from 'node:child_process'

const packageJsonDir = path.resolve(import.meta.dirname, '..')
let electronProcess
let setModuleProcess

function setPackageToModule() {
  return new Promise((resolve, _) => {
    setModuleProcess = exec('npm run set-module', { cwd: packageJsonDir }, (error) => {
      if (error) {
        console.error(error)
      }

      return resolve()
    })
  })
}

const setCommonJSProcess = exec('npm run set-commonjs', { cwd: packageJsonDir }, (error) => {
  if (error) {
    console.error(error)
  }

  setCommonJSProcess?.kill()

  electronProcess = exec('electron .', {
    cwd: packageJsonDir,
    env: {
      ...process.env,
      NODE_MODE: 'development',
    },
  })

  //Pencereden kapatma işleminde çalışır.
  electronProcess.on('exit', async (code) => {
    if (code != 0) {
      console.error(`Electron process exited with code ${code}`)
    }

    await setPackageToModule()
    setModuleProcess?.kill()
  })
})

// ctrl+c ile durdurma işlemini yakalar.
process.on('SIGINT', async () => {
  console.log('Process interrupted by SIGINT')
  electronProcess?.kill()
})
