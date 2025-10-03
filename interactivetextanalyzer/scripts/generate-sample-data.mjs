import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const outDir = path.join(root, 'example_data')
const outFile = path.join(outDir, 'sample-data.csv')

fs.mkdirSync(outDir, { recursive: true })

const headers = ['id','category','review','notes','date','rating','customer_region']

const categories = ['Books','Electronics','Home','Toys','Grocery','Clothing','Tools','Pets']
const regions = ['NA','EU','APAC']

const positives = [
  'Exceptional pacing and layered mystery kept me hooked',
  'Battery life outstanding; display vibrant under sunlight',
  'Assembly intuitive; materials feel premium and dense',
  'STEM kit engaged kids collaboratively for hours',
  'Cold brew smooth; balanced acidity and chocolate finish',
  'Breathable fabric with consistent color retention',
  'High torque with balanced vibration control',
  'Dogs consistently engage; durable exterior after weeks'
]
const negatives = [
  'Predictable plot with shallow character arcs',
  'Overheats rapidly during moderate video rendering',
  'Warped panel and misaligned pre-drilled holes',
  'Magnets detached within minutes of first use',
  'Packaging crushed; contents stale and flavorless',
  'Color blotched and faded after single wash',
  'Handle cracked under light rotational stress',
  'Fabric seam frayed and stuffing escaped rapidly'
]
const uniques = [
  'Sparse experimental haiku about quantum states',
  'Device emitted lavender scent unexpectedly',
  'Chair whispers soft static when moonlight enters',
  'Puzzle reveals phosphorescent star map',
  'Sauce tastes like smoked cinnamon lightning',
  'Wrench resonates faint harmonic at even torque',
  'Parrot mimics startup chime with uncanny accuracy'
]

function pad(n){ return String(n).padStart(2,'0') }

const rows = []
rows.push(headers.join(','))

let id = 1
const start = new Date('2024-01-01T00:00:00Z')

for (let i = 0; i < 5000; i++) {
  const cat = categories[i % categories.length]
  const region = regions[i % regions.length]
  const day = new Date(start.getTime() + (i%365)*86400000)
  const date = `${day.getUTCFullYear()}-${pad(day.getUTCMonth()+1)}-${pad(day.getUTCDate())}`

  // Create clusters: 70% repeated sentiments, 25% mixed, 5% unique quirky
  let review, notes, rating
  const r = Math.random()
  if (r < 0.35) { // positive cluster
    review = positives[i % positives.length]
    notes = 'Consistent praise pattern'
    rating = 5
  } else if (r < 0.70) { // negative cluster
    review = negatives[i % negatives.length]
    notes = 'Consistent complaint pattern'
    rating = (i % 3 === 0) ? 1 : 2
  } else if (r < 0.95) { // mixed
    const pv = positives[i % positives.length]
    const nv = negatives[(i*3) % negatives.length]
    review = `${pv}; but ${nv}`
    notes = 'Mixed experience'
    rating = 3
  } else { // unique outlier
    const u = uniques[i % uniques.length]
    review = `${u} · unique-${i}`
    notes = 'Outlier narrative'
    rating = 4
  }

  // Escape quotes
  const esc = v => '"' + String(v).replaceAll('"','""') + '"'
  const row = [id, cat, esc(review), esc(notes), date, rating, region]
  rows.push(row.join(','))
  id++
}

fs.writeFileSync(outFile, rows.join('\n'))

// Also copy into dist/example_data if a build exists
const distDir = path.join(root, 'dist', 'example_data')
try {
  fs.mkdirSync(distDir, { recursive: true })
  fs.copyFileSync(outFile, path.join(distDir, 'sample-data.csv'))
} catch {}

console.log(`Generated ${id-1} rows -> ${path.relative(root, outFile)}`)
