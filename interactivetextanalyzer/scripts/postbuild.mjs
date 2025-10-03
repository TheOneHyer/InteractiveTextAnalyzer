import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const indexHtml = path.join(dist, 'index.html')
const fourOhFour = path.join(dist, '404.html')
const nojekyll = path.join(dist, '.nojekyll')

if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, fourOhFour)
}
fs.writeFileSync(nojekyll, '')

console.log('Postbuild: 404.html and .nojekyll created.')
