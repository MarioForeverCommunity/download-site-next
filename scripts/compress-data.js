import { createReadStream, createWriteStream, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { createGzip, createBrotliCompress, constants as zlibConstants } from 'zlib'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DATA_DIR = join(__dirname, '../public/data')
const DIST_DATA_DIR = join(__dirname, '../dist/data')
const THRESHOLD = 5120

async function compressFile(filePath, outputPath, algorithm) {
  return new Promise((resolve, reject) => {
    const readStream = createReadStream(filePath)
    let writeStream

    if (algorithm === 'gzip') {
      writeStream = createGzip({ level: 9 })
    } else if (algorithm === 'brotli') {
      writeStream = createBrotliCompress({
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 11
        }
      })
    }

    const compressedStream = createWriteStream(outputPath)

    readStream
      .pipe(writeStream)
      .pipe(compressedStream)
      .on('finish', resolve)
      .on('error', reject)
  })
}

async function compressDataFiles() {
  console.log('Compressing YAML files...')

  const dataDir = existsSync(DIST_DATA_DIR) ? DIST_DATA_DIR : DATA_DIR

  if (!existsSync(dataDir)) {
    console.log('Data directory not found, skipping compression')
    return
  }

  const files = readdirSync(dataDir)
  const yamlFiles = files.filter(file => file.endsWith('.yaml'))

  for (const file of yamlFiles) {
    const filePath = join(dataDir, file)
    const stats = statSync(filePath)

    if (stats.size < THRESHOLD) {
      console.log(`Skipping ${file} (size: ${stats.size} bytes < threshold: ${THRESHOLD} bytes)`)
      continue
    }

    console.log(`Compressing ${file} (${stats.size} bytes)...`)

    try {
      await compressFile(filePath, `${filePath}.gz`, 'gzip')
      await compressFile(filePath, `${filePath}.br`, 'brotli')
      console.log(`✓ Compressed ${file}`)
    } catch (error) {
      console.error(`✗ Failed to compress ${file}:`, error.message)
    }
  }

  console.log('YAML file compression completed')
}

compressDataFiles()
