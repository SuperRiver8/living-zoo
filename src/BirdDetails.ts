import {Bone,Box3,BufferGeometry,Color,DoubleSide,Float32BufferAttribute,Group,Mesh,MeshStandardMaterial,SphereGeometry} from 'three'
import type {SpeciesId} from './world'

type BirdId=Extract<SpeciesId,'parrot'|'flamingo'|'peacock'>
const palettes:Record<BirdId,{cover:string;secondary:string;primary:string;edge:string}>={
 parrot:{cover:'#d33127',secondary:'#f2c938',primary:'#176ba9',edge:'#173c73'},
 flamingo:{cover:'#ecaaa9',secondary:'#f5c8bd',primary:'#dd7b8c',edge:'#303741'},
 peacock:{cover:'#155f74',secondary:'#2b947c',primary:'#154b80',edge:'#473b63'},
}

// 中脊隆起、羽端收尖；每片飞羽有自己的轮廓，折翼时不会只像一整块平板。
function feather(length:number,width:number,sweep:number,side:number,root:string,tip:string){
 const positions:number[]=[],colors:number[]=[],indices:number[]=[],a=new Color(root),b=new Color(tip)
 for(let i=0;i<=10;i++){
  const t=i/10,x=side*length*t,z=sweep*t,half=width*Math.pow(Math.sin(Math.PI*t),.72)*(1-.18*t)
  for(const [offset,lift,shade] of [[-half,0,.82],[0,.018*Math.sin(Math.PI*t),1.1],[half,0,.82]] as const){
   positions.push(x,lift,z+offset)
   const c=a.clone().lerp(b,t*.8).multiplyScalar(shade);colors.push(c.r,c.g,c.b)
  }
  if(i<10){const k=i*3;indices.push(k,k+1,k+3,k+1,k+4,k+3,k+1,k+2,k+4,k+2,k+5,k+4)}
 }
 const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setAttribute('color',new Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry
}

export function addBirdDetails(id:BirdId,box:Box3,height:number,head:Bone,feet:Bone[],wings:[Bone,Bone],tips:[Bone,Bone]){
 const palette=palettes[id],span=height*(id==='parrot'?.73:id==='flamingo'?.43:.47)
 const material=new MeshStandardMaterial({vertexColors:true,side:DoubleSide,roughness:.83,metalness:0})
 for(let i=0;i<2;i++){
  const side=i===0?1:-1,wing=wings[i],tip=tips[i]
  // 覆羽留在肩部，初级飞羽由翼尖骨驱动，飞行时两段会错时弯折。
  const cover=new Mesh(feather(span*(id==='parrot'?.78:.48),span*(id==='parrot'?.21:.14),-span*.14,side,palette.cover,palette.secondary),material)
  cover.castShadow=true;cover.receiveShadow=true;wing.add(cover)
  if(id==='parrot'){const flightBlade=new Mesh(feather(span*.48,span*.14,-span*.12,side,palette.cover,palette.primary),material);flightBlade.castShadow=true;tip.add(flightBlade)}
  for(let j=0;j<8;j++){
   const f=new Mesh(feather(span*(.31+j*.008),span*.073,-span*(.11+j*.027),side,palette.secondary,j>5?palette.edge:palette.primary),material)
   f.position.set(side*span*(j*.025),-.004,-span*(.055+j*.022));f.castShadow=true;tip.add(f)
  }
  for(let j=0;j<9;j++){
   const f=new Mesh(feather(span*(.36+(8-j)*.012),span*.068,-span*(.08+j*.035),side,palette.primary,j>5?palette.edge:palette.secondary),material)
   f.position.set(side*span*(j*.025),-.006,-span*(j*.032));f.castShadow=true;tip.add(f)
  }
 }
 const toeMat=new MeshStandardMaterial({color:id==='flamingo'?'#b7656c':'#4d4941',roughness:.7})
 const clawMat=new MeshStandardMaterial({color:'#33322e',roughness:.48})
 const footSize=height*(id==='flamingo'?.074:.08),soleHeight=height*(id==='peacock'?.17:id==='parrot'?.13:.035)
 for(const foot of feet){
  for(let j=-1;j<=1;j++){
   const toe=new Group();toe.position.set(j*footSize*.38,soleHeight,footSize*.15);toe.rotation.y=j*.34;foot.add(toe)
   const shaft=new Mesh(new SphereGeometry(1,8,6),toeMat);shaft.scale.set(footSize*.16,footSize*.13,footSize*.67);shaft.position.z=footSize*.43;toe.add(shaft)
   const claw=new Mesh(new SphereGeometry(1,8,6),clawMat);claw.scale.set(footSize*.095,footSize*.09,footSize*.2);claw.position.z=footSize*1.08;toe.add(claw)
  }
 }
 if(id==='peacock'){
  const crestMat=new MeshStandardMaterial({color:'#176a84',roughness:.72}),eyeMat=new MeshStandardMaterial({color:'#287b91',roughness:.4})
  for(let i=-2;i<=2;i++){
   const featherStem=new Group();featherStem.position.set(i*height*.016,height*.28,box.max.z*.18);featherStem.rotation.z=-i*.18;head.add(featherStem)
   const stem=new Mesh(new SphereGeometry(1,6,5),crestMat);stem.scale.set(height*.006,height*.09,height*.006);stem.position.y=height*.075;featherStem.add(stem)
   const crown=new Mesh(new SphereGeometry(1,8,6),eyeMat);crown.scale.set(height*.023,height*.032,height*.014);crown.position.y=height*.16;featherStem.add(crown)
  }
 }
}
