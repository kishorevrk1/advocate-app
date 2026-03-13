/**
 * Generate all app icons from icon-source.svg using sharp.
 * Run: node scripts/generate-icons.js
 */
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const ASSETS = path.join(__dirname, '../assets')
const SVG = fs.readFileSync(path.join(ASSETS, 'icon-source.svg'))

const jobs = [
  // Main icon — 1024x1024
  { file: 'icon.png', size: 1024 },
  // Splash icon — centered on transparent, 200x200
  { file: 'splash-icon.png', size: 200 },
  // Android adaptive icon foreground — 1024x1024
  { file: 'android-icon-foreground.png', size: 1024 },
  // Favicon — 196x196
  { file: 'favicon.png', size: 196 },
]

async function generateIcons() {
  console.log('Generating icons from icon-source.svg...\n')

  for (const job of jobs) {
    const outPath = path.join(ASSETS, job.file)
    await sharp(SVG)
      .resize(job.size, job.size)
      .png()
      .toFile(outPath)
    console.log(`  ✓  ${job.file}  (${job.size}x${job.size})`)
  }

  // Android background — solid dark color matching app bg
  const bgSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
      <rect width="1024" height="1024" fill="#080816"/>
    </svg>
  `)
  await sharp(bgSvg).resize(1024, 1024).png()
    .toFile(path.join(ASSETS, 'android-icon-background.png'))
  console.log('  ✓  android-icon-background.png  (1024x1024)')

  // Android monochrome — white silhouette of the gavel on transparent
  const monoSvg = fs.readFileSync(path.join(ASSETS, 'icon-source.svg'), 'utf8')
    // Make everything white for monochrome
    .replace(/fill="url\(#[^"]+\)"/g, 'fill="#FFFFFF"')
    .replace(/fill="#[0-9A-Fa-f]{3,6}"/g, 'fill="#FFFFFF"')
    .replace(/stroke="#[0-9A-Fa-f]{3,6}"/g, 'stroke="#FFFFFF"')
    .replace(/fill="url\(#bgGrad\)"/g, 'fill="transparent"')

  await sharp(Buffer.from(monoSvg)).resize(1024, 1024).png()
    .toFile(path.join(ASSETS, 'android-icon-monochrome.png'))
  console.log('  ✓  android-icon-monochrome.png  (1024x1024)')

  console.log('\nAll icons generated successfully!')
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err.message)
  process.exit(1)
})
