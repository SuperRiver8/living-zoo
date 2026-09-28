import {useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {useGLTF} from '@react-three/drei'
import {Bone,Box3,BufferAttribute,Float32BufferAttribute,Group,MathUtils,Mesh,MeshStandardMaterial,Skeleton,SkinnedMesh,Uint16BufferAttribute,CanvasTexture,DoubleSide,SRGBColorSpace} from 'three'
import {addEyes,addWhiskers,detailedMaterial,furGeometry} from './AnimalDetails'
import {addBirdDetails} from './BirdDetails'
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js'
import {modelUrl} from './modelUrl'
import {info,species,type Animal,type SpeciesId} from './zoo'
type Anatomy={hip:number;front:number;back:number;side:number;neck:number;neckY:number;bird?:boolean}
const anatomy:Record<SpeciesId,Anatomy>={
 lion:{hip:.61,front:.65,back:-.72,side:.22,neck:.62,neckY:.72},tiger:{hip:.63,front:.64,back:-.72,side:.22,neck:.72,neckY:.72},
 elephant:{hip:.57,front:.94,back:-1.32,side:.69,neck:1.2,neckY:.66},giraffe:{hip:.43,front:.33,back:-.76,side:.3,neck:.25,neckY:.56},
 zebra:{hip:.51,front:.35,back:-.62,side:.18,neck:.38,neckY:.6},panda:{hip:.44,front:.31,back:-.43,side:.22,neck:.33,neckY:.65},
 kangaroo:{hip:.38,front:.3,back:-.18,side:.22,neck:.3,neckY:.67},deer:{hip:.36,front:.31,back:-.57,side:.17,neck:.35,neckY:.48},
 hippo:{hip:.37,front:.76,back:-.85,side:.36,neck:.74,neckY:.61},flamingo:{hip:.54,front:.03,back:.03,side:.07,neck:.03,neckY:.68,bird:true},
 peacock:{hip:.34,front:.49,back:.49,side:.13,neck:.47,neckY:.6,bird:true},parrot:{hip:.29,front:.27,back:.27,side:.05,neck:.28,neckY:.65,bird:true}}
type Rig={group:Group;height:number;factor:number}
const cache=new Map<SpeciesId,Rig>()
const smooth=(lo:number,hi:number,v:number)=>{const t=MathUtils.clamp((v-lo)/(hi-lo),0,1);return t*t*(3-2*t)}
function makeRig(scene:Group,id:SpeciesId):Rig{
 const previous=cache.get(id);if(previous)return previous
 scene.updateMatrixWorld(true);const box=new Box3().setFromObject(scene),height=box.max.y-box.min.y,an=anatomy[id],factor=info[id].height/height
 const group=new Group(),bones:Bone[]=[],root=new Bone();root.name='body';bones.push(root);group.add(root)
 const add=(name:string,x:number,y:number,z:number,parent=root)=>{const b=new Bone();b.name=name;b.position.set(x,y,z);parent.add(b);bones.push(b);return b}
 const head=add('head',0,height*an.neckY,an.neck);add('jaw',0,height*.03,height*.17,head)
 const tail=add('tail',0,height*.56,box.min.z*.65)
 const legs: {upper:Bone;lower:Bone;foot:Bone;x:number;z:number}[]=[]
 for(let i=0;i<(an.bird?2:4);i++){const x=an.side*(i%2===0?1:-1),z=i<2?an.front:an.back,upper=add(`leg${i}`,x,height*an.hip,z),lower=add(`knee${i}`,0,-height*an.hip*.52,0,upper),foot=add(`foot${i}`,0,-height*an.hip*.46,0,lower);legs.push({upper,lower,foot,x,z})}
 const wingL=add('wingL',an.side,height*.65,0),wingR=add('wingR',-an.side,height*.65,0)
 const span=height*(id==='parrot'?.73:id==='flamingo'?.43:.47)
 const wingTipL=add('wingTipL',span*.57,0,-span*.08,wingL),wingTipR=add('wingTipR',-span*.57,0,-span*.08,wingR)
 const trunk=add('trunk',0,height*.65,box.max.z*.75)
 const earL=add('earL',box.max.x*.6,height*.77,an.neck),earR=add('earR',box.min.x*.6,height*.77,an.neck)
 const idx=(b:Bone)=>bones.indexOf(b)
 scene.traverse(obj=>{if(!(obj instanceof Mesh))return;const original=(Array.isArray(obj.material)?obj.material[0]:obj.material) as MeshStandardMaterial;if(/eye/i.test(original.name))return;const geom=obj.geometry.clone();for(const name of ['position','normal']){const attr=geom.getAttribute(name);if(attr){const floats=new Float32Array(attr.count*3);for(let i=0;i<attr.count;i++){floats[i*3]=attr.getX(i);floats[i*3+1]=attr.getY(i);floats[i*3+2]=attr.getZ(i)}geom.setAttribute(name,new Float32BufferAttribute(floats,3))}}
  // 先展开 GLB 的量化节点变换，再在统一模型空间计算骨骼权重。
  geom.applyMatrix4(obj.matrixWorld);const pos=geom.getAttribute('position') as BufferAttribute,indices=new Uint16Array(pos.count*4),weights=new Float32Array(pos.count*4)
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),h=height*an.hip;let b0=root,b1=root,w=0
   const leg=legs.reduce((best,l)=>Math.hypot(x-l.x,(z-l.z)*.75)<Math.hypot(x-best.x,(z-best.z)*.75)?l:best,legs[0]);const lateral=Math.abs(x)>an.side*.3,legZone=y<h*1.05&&lateral&&Math.abs(z-leg.z)<(an.bird?height*.19:height*.26)
   if(legZone){if(y<h*.5){b0=leg.lower;b1=leg.foot;w=1-smooth(h*.035,h*.18,y)}else {b0=leg.upper;b1=root;w=smooth(h*.72,h*1.05,y)}const knee=1-smooth(h*.4,h*.6,y);if(y>=h*.5&&y<h*.6){b0=leg.upper;b1=leg.lower;w=knee}}
   else if(id==='elephant'&&z>box.max.z*.73&&y<height*.75){b0=trunk;b1=head;w=smooth(height*.56,height*.74,y)}
   else if(y>height*an.neckY*.82&&z>an.neck-height*.1){b0=root;b1=head;w=smooth(an.neck-height*.1,an.neck+height*.2,z);if(id==='giraffe')w=Math.max(w,smooth(height*.52,height*.72,y));if(z>an.neck+height*.23||/nose/i.test(original.name)){b0=head;b1=head;w=0}}
   else if(z<box.min.z*.62&&y>h*.7){b0=root;b1=tail;w=1-smooth(box.min.z*.9,box.min.z*.58,z)}
   if(id==='parrot'&&Math.abs(x)>an.side*1.2&&y>h&&z<an.neck){b0=root;b1=x>0?wingL:wingR;w=smooth(an.side,Math.max(an.side*1.3,box.max.x),Math.abs(x))}
   if(id==='elephant'&&Math.abs(x)>box.max.x*.62&&y>height*.62&&z>.4){b0=root;b1=x>0?earL:earR;w=smooth(box.max.x*.6,box.max.x*.9,Math.abs(x))}
   indices[i*4]=idx(b0);indices[i*4+1]=idx(b1);weights[i*4]=1-w;weights[i*4+1]=w
  }
  geom.setAttribute('skinIndex',new Uint16BufferAttribute(indices,4));geom.setAttribute('skinWeight',new Float32BufferAttribute(weights,4));const material=detailedMaterial(original,id);const mesh=new SkinnedMesh(geom,material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;group.add(mesh);const fur=furGeometry(geom,id,original.name);if(fur){const fm=material.clone();fm.map=null;fm.vertexColors=true;fm.side=DoubleSide;const coat=new SkinnedMesh(fur,fm);coat.frustumCulled=false;group.add(coat)}
 });addEyes(head,scene,id);addWhiskers(head,scene,id);group.updateMatrixWorld(true);const skeleton=new Skeleton(bones);group.traverse(o=>{if(o instanceof SkinnedMesh)o.bind(skeleton)});if(an.bird)addBirdDetails(id as 'parrot'|'flamingo'|'peacock',box,height,head,legs.map(l=>l.foot),[wingL,wingR],[wingTipL,wingTipR]);const rig={group,height,factor};cache.set(id,rig);return rig
}
let featherTexture:CanvasTexture|undefined
function feather(){
 if(featherTexture)return featherTexture
 const c=document.createElement('canvas');c.width=256;c.height=768;const g=c.getContext('2d')!
 const fill=g.createLinearGradient(0,60,0,750);fill.addColorStop(0,'#948345');fill.addColorStop(.35,'#48836a');fill.addColorStop(.8,'#447948');fill.addColorStop(1,'#695e38')
 g.fillStyle=fill;g.beginPath();g.moveTo(128,752);g.bezierCurveTo(90,600,67,275,82,110);g.bezierCurveTo(91,42,165,42,174,110);g.bezierCurveTo(190,275,165,600,128,752);g.fill()
 // 羽枝顺着羽轴分叉，外缘留细碎的缝隙。
 for(let y=115;y<730;y+=7){const w=48*Math.pow(Math.sin((y-60)/710*Math.PI),.7);g.strokeStyle=y%3?'rgba(199,177,91,.46)':'rgba(24,73,65,.65)';g.lineWidth=1;g.beginPath();g.moveTo(128,y+20);g.lineTo(128-w,y);g.moveTo(128,y+20);g.lineTo(128+w,y);g.stroke()}
 for(const [rx,ry,color] of [[51,75,'#b4a65e'],[43,64,'#2b8b72'],[31,50,'#28659a'],[18,35,'#152e65'],[8,16,'#051d36']] as const){g.fillStyle=color;g.beginPath();g.ellipse(128,133,rx,ry,0,0,Math.PI*2);g.fill()}
 g.fillStyle='rgba(107,194,171,.7)';g.beginPath();g.ellipse(119,115,7,14,-.35,0,Math.PI*2);g.fill()
 g.strokeStyle='#d0ba74';g.lineWidth=2;g.beginPath();g.moveTo(128,754);g.lineTo(128,210);g.stroke()
 featherTexture=new CanvasTexture(c);featherTexture.colorSpace=SRGBColorSpace;return featherTexture
}
function PeacockFan({animal,height}:{animal:Animal;height:number}){
 const ref=useRef<Group>(null)
 useFrame((_,dt)=>{if(!ref.current)return;const open=animal.state==='display',t=1-Math.exp(-dt*2.5);ref.current.scale.x=MathUtils.lerp(ref.current.scale.x,open?1:.055,t);ref.current.rotation.x=MathUtils.lerp(ref.current.rotation.x,open?.07:-1.38,t);ref.current.rotation.y=open?Math.sin(animal.phase*8)*.025:0})
 return <group ref={ref} position={[0,height*.43,-height*.25]} scale={[.055,1,1]} rotation={[-1.38,0,0]}>
  {Array.from({length:43},(_,i)=>{const k=i-21,a=k*.054,length=height*(1.25+.32*Math.cos(a));return <group key={i} rotation={[0,0,a]}><mesh position={[0,length*.5,Math.abs(k)*-.001]} castShadow><planeGeometry args={[height*.145,length]}/><meshStandardMaterial map={feather()} transparent alphaTest={.18} side={DoubleSide} roughness={.78} depthWrite/></mesh></group>})}
 </group>
}
export default function RiggedAnimal({animal}:{animal:Animal}){
 // 这些模型没有 Draco / Meshopt 扩展，关闭解码器可兼容站点严格的 CSP。
 const {scene}=useGLTF(modelUrl(animal.species),false,false),rig=useMemo(()=>makeRig(scene,animal.species),[scene,animal.species]),model=useMemo(()=>clone(rig.group),[rig]),outer=useRef<Group>(null)
 const bones=useMemo(()=>{const map:Record<string,Bone>={};model.traverse(o=>{if(o instanceof Bone)map[o.name]=o});return map},[model])
 useFrame((_,dt)=>{const a=animal,an=anatomy[a.species],h=rig.height*an.hip,blend=Math.min(1,a.speed/info[a.species].speed),kang=a.species==='kangaroo',phase=a.gait,body=bones.body,flying=!!an.bird&&a.state==='fly',flightBlend=an.bird?MathUtils.clamp(a.altitude/1.5,0,1):0
  const bounce=flying?Math.sin(a.phase*12)*.018:kang?Math.max(0,Math.sin(phase))*.13*blend:Math.cos(phase*2)*.007*blend;body.position.y=bounce;body.rotation.z=Math.sin(phase)*.009*blend;body.rotation.x=MathUtils.lerp(body.rotation.x,flying?-.11:0,Math.min(1,dt*5))
  for(let i=0;i<(an.bird?2:4);i++){const offset=an.bird?i*Math.PI:kang?i<2?Math.PI:0:a.species==='giraffe'?(i%2)*Math.PI:(i===0?0:i===1?Math.PI:i===2?Math.PI*1.5:Math.PI*.5),t=((phase+offset)/(Math.PI*2)%1+1)%1,stance=.63,stride=info[a.species].stride/rig.factor*.48;let z:number,lift:number
   if(flying){bones[`leg${i}`].rotation.x=MathUtils.lerp(bones[`leg${i}`].rotation.x,.5,Math.min(1,dt*7));bones[`knee${i}`].rotation.x=MathUtils.lerp(bones[`knee${i}`].rotation.x,-.78,Math.min(1,dt*7));bones[`foot${i}`].rotation.x=.3;continue}
   if(t<stance){z=stride*(.5-t/stance);lift=0}else {const q=(t-stance)/(1-stance);z=stride*(-.5+q);lift=Math.sin(q*Math.PI)*h*.18}z*=blend;lift*=blend
   // 两段腿 IK：支撑期脚掌向后抵消前进，摆动期抬脚再落地。
   const l1=h*.52,l2=h*.48,y=-h+lift-.001,d=Math.min(l1+l2-.0001,Math.hypot(y,z)),knee=Math.acos(MathUtils.clamp((l1*l1+l2*l2-d*d)/(2*l1*l2),-1,1)),bend=(Math.PI-knee)*(i<2?-1:1),hip=Math.atan2(-z,-y)-Math.atan2(l2*Math.sin(bend),l1+l2*Math.cos(bend));bones[`leg${i}`].rotation.x=MathUtils.lerp(bones[`leg${i}`].rotation.x,hip,Math.min(1,dt*14));bones[`knee${i}`].rotation.x=MathUtils.lerp(bones[`knee${i}`].rotation.x,bend,Math.min(1,dt*14));bones[`foot${i}`].rotation.x=-hip-bend
  }
  const eating=a.state==='eat',attack=a.state==='attack';bones.head.rotation.x=MathUtils.lerp(bones.head.rotation.x,eating?(a.species==='giraffe'?.11:.32)+Math.sin(a.phase*4)*.025:attack?-.15:Math.sin(a.phase*.8)*.025,Math.min(1,dt*4));bones.head.rotation.y=Math.sin(a.phase*.5)*.07*(blend<.1?1:.25);bones.jaw.rotation.x=eating?Math.max(0,Math.sin(a.phase*7))*.035:attack?.06:0;bones.tail.rotation.y=Math.sin(a.phase*1.8)*.15;bones.trunk.rotation.x=eating?-.22+Math.sin(a.phase*2)*.2:Math.sin(phase)*.035*blend;bones.earL.rotation.y=Math.sin(a.phase*1.6)*.08;bones.earR.rotation.y=-Math.sin(a.phase*1.6)*.08
  if(an.bird){const flap=Math.sin(a.phase*13),stroke=(.16+flap*.95+Math.sin(a.phase*26)*.08)*flightBlend
   for(const [side,wing,tip] of [[1,bones.wingL,bones.wingTipL],[-1,bones.wingR,bones.wingTipR]] as const){const t=Math.min(1,dt*9);wing.scale.x=MathUtils.lerp(wing.scale.x,.48+.52*flightBlend,t);wing.rotation.x=MathUtils.lerp(wing.rotation.x,-.68-.3*flightBlend,t);wing.rotation.y=MathUtils.lerp(wing.rotation.y,side*(1.48*(1-flightBlend)+.08*flightBlend),t);wing.rotation.z=MathUtils.lerp(wing.rotation.z,side*(stroke+.025*Math.sin(a.phase*2)*(1-flightBlend)),t);tip.scale.x=MathUtils.lerp(tip.scale.x,.06+.94*flightBlend,t);tip.rotation.y=MathUtils.lerp(tip.rotation.y,side*(.4*(1-flightBlend)-.2*flightBlend),t);tip.rotation.z=MathUtils.lerp(tip.rotation.z,side*Math.sin(a.phase*13-.7)*.16*flightBlend,t)}
  }
  if(outer.current){outer.current.rotation.x=attack?-Math.sin(Math.max(0,a.timer)*Math.PI)*.09:0;outer.current.position.y=a.recoil>0?Math.sin(a.recoil*9)*.025:0}
 })
 return <group ref={outer} scale={rig.factor*animal.scale}><primitive object={model}/>{animal.species==='peacock'&&<PeacockFan animal={animal} height={rig.height}/>}</group>
}
species.forEach(s=>useGLTF.preload(modelUrl(s.id),false,false))
