// 修改 GLB 的嵌入贴图方式后更新版本，避免 CDN 与浏览器复用旧模型缓存。
const modelRevision='20260928-static-textures'
export const modelUrl=(name:string)=>`${import.meta.env.BASE_URL}models/${name}.glb?v=${modelRevision}`
