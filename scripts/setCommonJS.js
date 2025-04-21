import fs from 'node:fs'
import path from 'node:path'

const packageJsonPath = path.resolve(import.meta.dirname, '../package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

packageJson.type = 'commonjs'

fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')
