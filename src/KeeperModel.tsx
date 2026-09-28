import {useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {CanvasTexture,Group,MathUtils,MeshStandardMaterial,RepeatWrapping} from 'three'
import type {Keeper} from './zoo'

let clothTexture:CanvasTexture|undefined
function fabric(color:string){
 const material=new MeshStandardMaterial({color,roughness:.96})
 if(!clothTexture){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128
  const ctx=canvas.getContext('2d')!,pixels=ctx.createImageData(128,128)
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
   const weave=((x+y)%4===0?18:0)+(x%2===0?9:0)+(y%2===0?7:0)
   const i=(y*128+x)*4,v=112+weave
   pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255
  }
  ctx.putImageData(pixels,0,0)
  clothTexture=new CanvasTexture(canvas);clothTexture.wrapS=clothTexture.wrapT=RepeatWrapping
  clothTexture.repeat.set(4,4)
 }
 material.bumpMap=clothTexture;material.bumpScale=.008
 return material
}
const leather=new MeshStandardMaterial({color:'#37372d',roughness:.88})
const metal=new MeshStandardMaterial({color:'#818b88',metalness:.55,roughness:.42})
const eye=new MeshStandardMaterial({color:'#25221e',roughness:.3})

function Rounded({at,radius,length,scale,material}:{at:[number,number,number];radius:number;length:number;scale?:[number,number,number];material:MeshStandardMaterial}){
 return <mesh position={at} scale={scale} material={material} castShadow><capsuleGeometry args={[radius,length,6,12]}/></mesh>
}

export default function KeeperModel({keeper}:{keeper:Keeper}){
 const body=useRef<Group>(null),leftLeg=useRef<Group>(null),rightLeg=useRef<Group>(null)
 const leftKnee=useRef<Group>(null),rightKnee=useRef<Group>(null)
 const leftArm=useRef<Group>(null),rightArm=useRef<Group>(null)
 const leftElbow=useRef<Group>(null),rightElbow=useRef<Group>(null)
 const materials=useMemo(()=>({
  shirt:fabric(['#697b56','#64765a','#728062','#6b7859'][keeper.id%4]),
  vest:fabric('#92845f'),pants:fabric('#6b715b'),skin:fabric(['#a97857','#c89972','#8d634c','#b38563'][keeper.id%4]),
  hair:fabric('#302b27'),hat:fabric('#8c8564'),trim:fabric('#c2b68a')
 }),[keeper.id])
 useFrame((_,dt)=>{
  const walking=keeper.state==='walk',phase=keeper.phase*7,step=walking?1:0
  const left=Math.sin(phase)*step,right=-left
  const approach=Math.min(1,dt*12)
  if(body.current){body.current.position.y=Math.abs(Math.cos(phase))*.018*step;body.current.rotation.z=Math.sin(phase)*.025*step;body.current.rotation.x=MathUtils.lerp(body.current.rotation.x,walking?.015:.14,approach)}
  if(leftLeg.current)leftLeg.current.rotation.x=MathUtils.lerp(leftLeg.current.rotation.x,left*.37,approach)
  if(rightLeg.current)rightLeg.current.rotation.x=MathUtils.lerp(rightLeg.current.rotation.x,right*.37,approach)
  if(leftKnee.current)leftKnee.current.rotation.x=MathUtils.lerp(leftKnee.current.rotation.x,Math.max(0,-left)*.62,approach)
  if(rightKnee.current)rightKnee.current.rotation.x=MathUtils.lerp(rightKnee.current.rotation.x,Math.max(0,-right)*.62,approach)
  if(leftArm.current)leftArm.current.rotation.x=MathUtils.lerp(leftArm.current.rotation.x,-left*.3,approach)
  if(rightArm.current)rightArm.current.rotation.x=MathUtils.lerp(rightArm.current.rotation.x,walking?-right*.29:-.52,approach)
  if(leftElbow.current)leftElbow.current.rotation.x=MathUtils.lerp(leftElbow.current.rotation.x,walking?-.18:-.55,approach)
  if(rightElbow.current)rightElbow.current.rotation.x=MathUtils.lerp(rightElbow.current.rotation.x,walking?-.18:-.65,approach)
 })
 return <group>
  {/* 两段腿分别转动，膝盖只在摆动期弯曲。 */}
  {[-1,1].map((side)=><group key={side} ref={side<0?leftLeg:rightLeg} position={[side*.115,.94,0]}>
   <Rounded at={[0,-.23,0]} radius={.095} length={.27} scale={[1,1,.85]} material={materials.pants}/>
   <group ref={side<0?leftKnee:rightKnee} position={[0,-.48,.012]}>
    <mesh position={[0,-.02,0]} material={materials.pants} castShadow><cylinderGeometry args={[.076,.079,.11,12]}/></mesh>
    <Rounded at={[0,-.2,-.005]} radius={.078} length={.24} material={materials.pants}/>
    <mesh position={[0,-.415,.065]} material={leather} castShadow><boxGeometry args={[.18,.13,.29]}/></mesh>
    <mesh position={[0,-.35,-.005]} material={materials.trim} castShadow><boxGeometry args={[.175,.035,.17]}/></mesh>
   </group>
  </group>)}
  <group ref={body}>
   <mesh position={[0,.98,0]} scale={[1,.57,.74]} material={materials.pants} castShadow><sphereGeometry args={[.225,20,14]}/></mesh>
   <mesh position={[0,1.03,0]} material={leather} castShadow><cylinderGeometry args={[.207,.205,.065,20]}/></mesh>
   <mesh position={[0,1.03,.209]} material={metal} castShadow><boxGeometry args={[.07,.05,.015]}/></mesh>
   <Rounded at={[0,1.315,0]} radius={.19} length={.43} scale={[1.06,1,.75]} material={materials.shirt}/>
   <Rounded at={[0,1.33,-.13]} radius={.15} length={.3} scale={[1.06,1,.3]} material={materials.vest}/>
   {[-1,1].map(side=><group key={side}>
    <mesh position={[side*.112,1.32,.147]} material={materials.vest} castShadow><boxGeometry args={[.105,.36,.03]}/></mesh>
    <mesh position={[side*.112,1.23,.169]} material={materials.trim}><boxGeometry args={[.086,.006,.01]}/></mesh>
    <mesh position={[side*.112,1.36,.168]} material={leather}><boxGeometry args={[.073,.058,.012]}/></mesh>
    <mesh position={[side*.155,1.42,-.105]} material={leather} castShadow><boxGeometry args={[.055,.29,.03]}/></mesh>
   </group>)}
   <mesh position={[0,1.385,.181]} material={materials.trim}><boxGeometry args={[.015,.26,.013]}/></mesh>
   {[1.27,1.34,1.41].map(y=><mesh key={y} position={[.013,y,.189]} material={metal}><sphereGeometry args={[.008,8,6]}/></mesh>)}
   {[-1,1].map(side=><group key={`collar-${side}`}>
    <mesh position={[side*.069,1.565,.085]} rotation={[.28,0,side*.36]} material={materials.shirt} castShadow><boxGeometry args={[.095,.06,.13]}/></mesh>
    <mesh position={[side*.112,1.245,.171]} material={materials.trim}><boxGeometry args={[.08,.03,.012]}/></mesh>
   </group>)}
   <mesh position={[-.105,1.405,.18]} material={materials.trim}><boxGeometry args={[.075,.027,.013]}/></mesh>
   <mesh position={[0,1.565,0]} material={materials.skin} castShadow><cylinderGeometry args={[.07,.075,.14,12]}/></mesh>
   <group position={[0,1.7,.02]}>
    <mesh scale={[.94,1.12,.86]} material={materials.skin} castShadow><sphereGeometry args={[.126,24,18]}/></mesh>
    <mesh position={[0,-.04,.099]} scale={[.85,.65,.3]} material={materials.skin} castShadow><sphereGeometry args={[.105,12,8]}/></mesh>
    {[-1,1].map(side=><group key={side}>
     <mesh position={[side*.119,-.015,0]} material={materials.skin} castShadow><sphereGeometry args={[.024,10,8]}/></mesh>
     <mesh position={[side*.051,.018,.112]} material={eye}><sphereGeometry args={[.009,10,8]}/></mesh>
     <mesh position={[side*.052,.042,.108]} material={materials.hair} rotation={[0,0,side*.1]}><boxGeometry args={[.04,.007,.01]}/></mesh>
    </group>)}
    <mesh position={[0,-.01,.12]} scale={[.8,1.1,.9]} material={materials.skin} castShadow><sphereGeometry args={[.022,10,8]}/></mesh>
    <mesh position={[0,-.068,.12]} material={materials.hair}><boxGeometry args={[.049,.006,.01]}/></mesh>
    <mesh position={[0,.11,-.01]} material={materials.hair} castShadow><sphereGeometry args={[.119,20,12,0,Math.PI*2,0,Math.PI*.48]}/></mesh>
    <mesh position={[0,.16,0]} material={materials.hat} castShadow><cylinderGeometry args={[.132,.147,.103,20]}/></mesh>
    <mesh position={[0,.12,.027]} material={materials.hat} castShadow><cylinderGeometry args={[.222,.222,.02,24]}/></mesh>
    <mesh position={[0,.122,0]} material={materials.trim}><cylinderGeometry args={[.147,.147,.015,20]}/></mesh>
   </group>
   {[-1,1].map(side=><group key={side} ref={side<0?leftArm:rightArm} position={[side*.22,1.49,0]}>
    <Rounded at={[side*.012,-.19,0]} radius={.068} length={.22} material={materials.shirt}/>
    <mesh position={[side*.012,-.35,0]} material={materials.skin} castShadow><sphereGeometry args={[.06,12,10]}/></mesh>
    <group ref={side<0?leftElbow:rightElbow} position={[side*.012,-.35,0]}>
     <Rounded at={[0,-.165,0]} radius={.055} length={.2} material={materials.skin}/>
     <mesh position={[0,-.327,0]} scale={[1,1.2,.75]} material={materials.skin} castShadow><sphereGeometry args={[.072,12,10]}/></mesh>
     {side>0&&<group position={[.025,-.48,.035]}><mesh material={metal} castShadow><cylinderGeometry args={[.125,.105,.23,16]}/></mesh><mesh position={[0,.1,0]} material={leather}><torusGeometry args={[.123,.012,6,16]}/></mesh></group>}
    </group>
   </group>)}
  </group>
 </group>
}
