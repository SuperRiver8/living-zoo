import {existsSync,readFileSync,readdirSync} from 'node:fs'
import {join} from 'node:path'
import {expect,it} from 'vitest'

it('所有 GLB 贴图使用同站点文件，不再生成 blob 图片地址',()=>{
 const dir=join(process.cwd(),'public','models')
 for(const name of readdirSync(dir).filter(file=>file.endsWith('.glb'))){
  const bytes=readFileSync(join(dir,name)),json=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)))
  expect(json.extensionsUsed??[],`${name} 使用了需要额外解码器的压缩扩展`).not.toContain('KHR_draco_mesh_compression')
  expect(json.extensionsUsed??[],`${name} 使用了需要 WebAssembly 的压缩扩展`).not.toContain('EXT_meshopt_compression')
  for(const image of json.images??[]){
   expect(image.bufferView,`${name} 内嵌图片`).toBeUndefined()
   expect(image.uri,`${name} 图片路径`).toMatch(/^textures\/[a-z0-9-]+\.(webp|png|jpg)$/)
   const texture=join(dir,image.uri)
   expect(existsSync(texture),`${name} 缺少 ${image.uri}`).toBe(true)
   expect(readFileSync(texture).length).toBeGreaterThan(100)
  }
 }
})
