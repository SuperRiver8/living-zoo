import {useLayoutEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {BufferGeometry,Color,DoubleSide,Float32BufferAttribute,InstancedMesh,MeshStandardMaterial,Object3D} from 'three'

export type GrassTuft={x:number;y:number;z:number;height:number;spread:number;angle:number;color:string}

// 每簇由弯曲、收尖的叶片组成，底部较暗，草尖略带枯黄。
export function grassGeometry(){
 const positions:number[]=[],colors:number[]=[],indices:number[]=[]
 for(let blade=0;blade<8;blade++){
  const a=blade*Math.PI*2/8+.36*Math.sin(blade*4),dx=Math.cos(a),dz=Math.sin(a)
  const height=.72+.31*((blade*7%11)/10),bend=.17+.12*((blade*5%9)/8)
  const start=positions.length/3
  for(let segment=0;segment<4;segment++){
   const t=segment/3,width=(1-t)*(.025+.009*(blade%3))+.001
   const center=bend*t*t,sideX=-dz*width,sideZ=dx*width
   for(const side of [-1,1]){
    positions.push(dx*center+sideX*side,t*height,dz*center+sideZ*side)
    const shade=.54+t*.32+(blade%3)*.025
    colors.push(shade,shade*(1.03+t*.03),shade*(.68+t*.12))
   }
  }
  for(let segment=0;segment<3;segment++){
   const p=start+segment*2
   indices.push(p,p+1,p+2,p+1,p+3,p+2)
  }
 }
 const geometry=new BufferGeometry()
 geometry.setAttribute('position',new Float32BufferAttribute(positions,3))
 geometry.setAttribute('color',new Float32BufferAttribute(colors,3))
 geometry.setIndex(indices)
 geometry.computeVertexNormals()
 return geometry
}

export default function Grass({tufts}:{tufts:GrassTuft[]}){
 const mesh=useRef<InstancedMesh>(null)
 const geometry=useMemo(grassGeometry,[])
 const material=useMemo(()=>{
  const m=new MeshStandardMaterial({color:'#ffffff',vertexColors:true,side:DoubleSide,roughness:1})
  m.onBeforeCompile=(shader)=>{
   m.userData.shader=shader
   shader.uniforms.uGrassTime={value:0}
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uGrassTime;')
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    transformed.x += sin(uGrassTime*1.3 + instanceMatrix[3].x*.21 + instanceMatrix[3].z*.17 + position.y*2.1)*position.y*position.y*.065;`)
  }
  return m
 },[])
 useLayoutEffect(()=>{
  const dummy=new Object3D()
  tufts.forEach((tuft,i)=>{
   dummy.position.set(tuft.x,tuft.y,tuft.z)
   dummy.rotation.set(0,tuft.angle,0)
   dummy.scale.set(tuft.spread,tuft.height,tuft.spread)
   dummy.updateMatrix()
   mesh.current?.setMatrixAt(i,dummy.matrix)
   mesh.current?.setColorAt(i,new Color(tuft.color))
  })
  if(mesh.current){mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;mesh.current.computeBoundingSphere()}
 },[tufts])
 useFrame((state)=>{const shader=material.userData.shader as {uniforms:Record<string,{value:number}>}|undefined;if(shader)shader.uniforms.uGrassTime.value=state.clock.elapsedTime})
 return <instancedMesh ref={mesh} args={[geometry,material,tufts.length]} receiveShadow/>
}
