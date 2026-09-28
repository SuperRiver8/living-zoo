import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const modelDir = new URL('../public/models/', import.meta.url)
const textureDir = new URL('../public/models/textures/', import.meta.url)
await mkdir(textureDir, { recursive: true })

for (const filename of (await readdir(modelDir)).filter(name => name.endsWith('.glb'))) {
  const path = new URL(filename, modelDir)
  const glb = await readFile(path)
  if (glb.toString('ascii', 0, 4) !== 'glTF' || glb.readUInt32LE(4) !== 2 || glb.readUInt32LE(8) !== glb.length) throw new Error(`Invalid GLB: ${filename}`)
  const jsonSize = glb.readUInt32LE(12)
  if (glb.toString('ascii', 16, 20) !== 'JSON') throw new Error(`Missing JSON chunk: ${filename}`)
  const json = JSON.parse(glb.toString('utf8', 20, 20 + jsonSize))
  const binaryHeader = 20 + jsonSize
  const binarySize = glb.readUInt32LE(binaryHeader)
  if (glb.toString('ascii', binaryHeader + 4, binaryHeader + 8) !== 'BIN\0') throw new Error(`Missing binary chunk: ${filename}`)
  const binaryStart = binaryHeader + 8
  const binaryEnd = binaryStart + binarySize
  if (binaryEnd !== glb.length) throw new Error(`Unexpected GLB chunks: ${filename}`)
  const stem = basename(filename, '.glb')
  let converted = 0
  for (const [index, image] of (json.images ?? []).entries()) {
    if (image.bufferView === undefined) continue
    const view = json.bufferViews[image.bufferView]
    if (view.buffer !== 0) throw new Error(`Image uses unsupported buffer: ${filename}`)
    const extension = ({ 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' })[image.mimeType]
    if (!extension) throw new Error(`Unsupported image type ${image.mimeType}: ${filename}`)
    const start = binaryStart + (view.byteOffset ?? 0)
    const end = start + view.byteLength
    if (start < binaryStart || end > binaryEnd) throw new Error(`Image outside binary chunk: ${filename}`)
    const bytes = glb.subarray(start, end)
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 10)
    const textureName = `${stem}-${index}-${hash}.${extension}`
    await writeFile(new URL(textureName, textureDir), bytes)
    // 相对 GLB 的静态路径可兼容根目录和带前缀的部署地址。
    image.uri = `textures/${textureName}`
    delete image.bufferView
    converted++
  }
  if (!converted) continue
  const text = Buffer.from(JSON.stringify(json))
  const paddedSize = (text.length + 3) & ~3
  const output = Buffer.alloc(12 + 8 + paddedSize + 8 + binarySize, 0x20)
  output.write('glTF', 0, 'ascii')
  output.writeUInt32LE(2, 4)
  output.writeUInt32LE(output.length, 8)
  output.writeUInt32LE(paddedSize, 12)
  output.write('JSON', 16, 'ascii')
  text.copy(output, 20)
  output.writeUInt32LE(binarySize, 20 + paddedSize)
  output.write('BIN\0', 24 + paddedSize, 'ascii')
  glb.copy(output, 28 + paddedSize, binaryStart, binaryEnd)
  const temporary = join(fileURLToPath(modelDir), `${filename}.tmp`)
  await writeFile(temporary, output)
  await rename(temporary, path)
  console.log(`${filename}: ${converted} texture(s) written as same-origin files`)
}
