import {useMemo} from 'react'
import {useGLTF} from '@react-three/drei'
import {Box3,CanvasTexture,ExtrudeGeometry,Mesh,MeshStandardMaterial,RepeatWrapping,Shape,SRGBColorSpace,Vector3} from 'three'
import {baseHeight} from './world'
import {modelUrl} from './modelUrl'

const bronze=new MeshStandardMaterial({color:'#8a704b',metalness:.45,roughness:.48})
const stone=new MeshStandardMaterial({color:'#c8bfaa',roughness:.87})
const darkStone=new MeshStandardMaterial({color:'#364c44',roughness:.57,metalness:.12})
const brass=new MeshStandardMaterial({color:'#bd9c55',metalness:.72,roughness:.3})
export function Sign({text,width,height,size=100}:{text:string;width:number;height:number;size?:number}){const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=2048;c.height=256;const g=c.getContext('2d')!;g.clearRect(0,0,c.width,c.height);g.fillStyle='#eadbb1';g.shadowColor='#bba36a';g.shadowBlur=2;g.font=`600 ${size}px "Microsoft YaHei", "Noto Sans SC", sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,1024,128);const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t},[text,size]);return <mesh><planeGeometry args={[width,height]}/><meshStandardMaterial map={texture} transparent roughness={.4} metalness={.35} depthWrite={false}/></mesh>}
function Block({position,size,material=stone}:{position:[number,number,number];size:[number,number,number];material?:MeshStandardMaterial}){return <mesh position={position} material={material} castShadow receiveShadow><boxGeometry args={size}/></mesh>}
function Statue({kind,x}:{kind:'gorilla'|'lion';x:number}){const {scene}=useGLTF(modelUrl(kind),false,false);const model=useMemo(()=>{const copy=scene.clone(true),box=new Box3().setFromObject(copy),size=box.getSize(new Vector3());copy.scale.setScalar(5.5/size.y);copy.position.y=-box.min.y*5.5/size.y;copy.position.x=-(box.min.x+box.max.x)/2*5.5/size.y;copy.position.z=-(box.min.z+box.max.z)/2*5.5/size.y;copy.traverse(o=>{if(o instanceof Mesh){o.material=bronze;o.castShadow=true;o.receiveShadow=true}});return copy},[scene]);return <group position={[x,0,5]}>
 <Block position={[0,.2,0]} size={[7,.4,8]}/><Block position={[0,1.05,0]} size={[5.7,1.3,6.6]} material={darkStone}/><Block position={[0,1.82,0]} size={[6.2,.24,7.1]} material={brass}/><Block position={[0,2.05,0]} size={[6.5,.25,7.4]}/><group position={[0,2.2,0]}><primitive object={model}/></group><group position={[0,1.1,3.32]}><Sign text={kind==='gorilla'?'山林守望 · 大猩猩':'草原之王 · 雄狮'} width={4.5} height={.65} size={110}/></group>
 </group>}
export default function Entrance(){const arch=useMemo(()=>{const s=new Shape();s.moveTo(-8.8,0);s.lineTo(-8.8,10.2);s.lineTo(8.8,10.2);s.lineTo(8.8,0);s.lineTo(6.8,0);s.lineTo(6.8,5.8);s.bezierCurveTo(6.8,10,-6.8,10,-6.8,5.8);s.lineTo(-6.8,0);s.closePath();return new ExtrudeGeometry(s,{depth:2,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.12,bevelThickness:.12,curveSegments:48})},[])
 const paving=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d')!;g.fillStyle='#b8b3a5';g.fillRect(0,0,512,512);for(let y=0;y<8;y++)for(let x=0;x<8;x++){const n=Math.sin(x*21+y*71)*.5+.5;g.fillStyle=`rgb(${173+n*22},${169+n*21},${153+n*21})`;g.fillRect(x*64+2,y*64+2,60,60)}const t=new CanvasTexture(c);t.wrapS=t.wrapT=RepeatWrapping;t.repeat.set(7,5);t.colorSpace=SRGBColorSpace;return t},[])
 return <group position={[26,baseHeight(26,112),112]}>
 <Block position={[0,.12,5]} size={[49,.24,29]}/><mesh position={[0,.25,5]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[49,29]}/><meshStandardMaterial map={paving} roughness={.82}/></mesh>
 <mesh geometry={arch} position={[0,0,-1]} material={stone} castShadow receiveShadow/>
 <Block position={[0,10.55,0]} size={[22,1.4,3.2]} material={darkStone}/><Block position={[0,11.34,0]} size={[23,.18,3.8]} material={brass}/><Block position={[0,11.63,0]} size={[24,.4,4.1]}/>
 <group position={[0,10.58,1.62]}><Sign text="好吃懒做动物园" width={20} height={2.3} size={148}/></group><group position={[0,9.56,1.18]}><Sign text="S L O W   D A Y S   ·   W I L D   L I V E S" width={14} height={1} size={57}/></group>
 {[-1,1].map(side=><group key={side} position={[side*9.2,0,0]}><Block position={[0,.3,0]} size={[3.3,.6,4.4]}/><Block position={[0,5.3,0]} size={[2.7,9.4,3.3]} material={darkStone}/>{[-.95,.95].map(x=><Block key={x} position={[x,5.25,1.72]} size={[.23,9.1,.2]} material={brass}/>)}{Array.from({length:9},(_,i)=><Block key={i} position={[0,1.3+i,1.7]} size={[2.65,.04,.1]}/>)}<Block position={[0,10.1,0]} size={[3.5,.4,4.2]}/></group>)}
 {[-1,1].map(side=><group key={side} position={[side*16,0,-1]}><Block position={[0,2.5,0]} size={[9,5,5]}/><Block position={[0,5.13,0]} size={[10,.26,6]} material={darkStone}/><Block position={[0,5.34,0]} size={[10.2,.12,6.1]} material={brass}/>{[-2.7,0,2.7].map(x=><group key={x}><Block position={[x,2.5,2.53]} size={[2.1,2.4,.08]} material={darkStone}/><Block position={[x,2.5,2.6]} size={[.06,2.4,.08]} material={brass}/></group>)}<group position={[0,4.32,2.56]}><Sign text={side===-1?'游客服务中心':'欢迎来到慢生活'} width={7} height={.8} size={115}/></group></group>)}
 <Statue kind="gorilla" x={-15}/><Statue kind="lion" x={15}/>
 {[-6.1,-4.3,-2.5,2.5,4.3,6.1].map(x=><group key={x} position={[x,0,1]}><Block position={[0,.55,0]} size={[.18,1.1,.18]} material={brass}/><Block position={[0,.8,0]} size={[1.15,.08,.08]} material={brass}/></group>)}
 {[-22,22].flatMap(x=>[1,10].map(z=><group key={`${x}-${z}`} position={[x,0,z]}><Block position={[0,.14,0]} size={[1.1,.28,1.1]} material={darkStone}/><mesh position={[0,2.2,0]} material={brass} castShadow><cylinderGeometry args={[.07,.12,4.2,12]}/></mesh><mesh position={[0,4.4,0]}><sphereGeometry args={[.28,20,16]}/><meshStandardMaterial color="#fff0c3" emissive="#ecd8a6" emissiveIntensity={.4}/></mesh></group>))}
 </group>
}
useGLTF.preload(modelUrl('gorilla'),false,false)
