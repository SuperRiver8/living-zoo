import {Bone,BufferGeometry,Float32BufferAttribute,Group,Mesh,MeshPhysicalMaterial,MeshStandardMaterial,SphereGeometry,TorusGeometry,Vector3} from 'three'
import {eyeAnchors} from './AnimalDetails'
import type {SpeciesId} from './world'

export type RemodeledMammal=Extract<SpeciesId,'hippo'|'elephant'|'giraffe'|'zebra'|'lion'|'kangaroo'|'tiger'|'panda'>
export const remodeledMammals=new Set<SpeciesId>(['hippo','elephant','giraffe','zebra','lion','kangaroo','tiger','panda'])

// 原 GLB 是静态网格。只矫正明显失真的轮廓，保留原有拓扑和 UV。
export function refineMammalShape(geometry:BufferGeometry,id:SpeciesId,part:string){
 if(id!=='hippo'&&id!=='giraffe'&&id!=='kangaroo'&&id!=='panda')return
 const old=geometry.getAttribute('position'),p=new Float32Array(old.count*3)
 for(let i=0;i<old.count;i++){
  let x=old.getX(i),y=old.getY(i),z=old.getZ(i)
  if(id==='hippo'&&z>1.02&&y>.68){const t=Math.min(1,(z-1.02)/.65);z=1.02+(z-1.02)*(.76+.04*t);x*=1-.15*t;y+=(y-1.1)*.035*t}
  if(id==='hippo'&&y<.36&&Math.abs(x)>.2&&Math.abs(z)>.58){const footX=Math.sign(x)*.37,footZ=z>0?.96:-1.08;x=footX+(x-footX)*.77;z=footZ+(z-footZ)*.79}
  if(id==='giraffe'&&y>4.22&&z>.9){const t=Math.min(1,(y-4.22)/.65);x*=1+.13*t;z=1.13+(z-1.13)*(1+.12*t)}
  if(id==='kangaroo'&&y>.85&&y<1.48){x*=1.07}
  if(id==='panda'&&part==='noseDark'){x*=.68;y=.76+(y-.76)*.65;z=.78+(z-.78)*.7}
  p[i*3]=x;p[i*3+1]=y;p[i*3+2]=z
 }
 geometry.setAttribute('position',new Float32BufferAttribute(p,3));geometry.computeVertexNormals()
}

export function mammalMaterial(original:MeshStandardMaterial,id:SpeciesId){
 const material=original.clone(),name=original.name
 if(id==='lion'&&name==='maneDark'){material.color.set('#9e7041');material.roughness=.96;material.bumpScale=.004}
 if(id==='elephant'&&name==='elephantGrey')material.color.set('#85817a')
 if(id==='hippo'&&name==='hippoGrey')material.color.set('#847b79')
 if(id==='hippo'&&name==='hippoPink')material.color.set('#9c7775')
 if(id==='elephant'||id==='hippo'){material.roughness=.94;material.bumpScale=id==='elephant'?.045:.032}
 if(id==='tiger'&&name==='tigerOrange')material.color.set('#d48338')
 if(id==='zebra'&&name==='zebraWhite')material.color.set('#dfddd2')
 if(id==='giraffe'&&name==='giraffeCream')material.color.set('#e3d7ae')
 if(id==='panda'&&name==='furWhite')material.color.set('#ddd9cb')
 if(id==='panda'&&name==='furBlack')material.color.set('#262627')
 if(id==='kangaroo'&&name==='kangarooRed')material.color.set('#b58264')
 return material
}

const eyeSize:Record<RemodeledMammal,number>={hippo:.033,elephant:.040,giraffe:.028,zebra:.028,lion:.036,kangaroo:.024,tiger:.034,panda:.025}
const irisColor:Record<RemodeledMammal,string>={hippo:'#413024',elephant:'#403327',giraffe:'#513321',zebra:'#34291f',lion:'#9a7640',kangaroo:'#503623',tiger:'#b19150',panda:'#272421'}
export function addMammalEyes(head:Bone,scene:Group,id:RemodeledMammal){
 const anchors=eyeAnchors(scene),size=eyeSize[id]
 for(const {center} of anchors){
  const outward=new Vector3(Math.sign(center.x)*.68,.05,.72).normalize(),eye=new Group()
  eye.position.copy(center).addScaledVector(outward,size*.14).sub(head.position)
  eye.quaternion.setFromUnitVectors(new Vector3(0,0,1),outward);head.add(eye)
  const globe=new Mesh(new SphereGeometry(size,16,12),new MeshPhysicalMaterial({color:'#16120f',roughness:.19,clearcoat:.55}));globe.scale.z=.65;eye.add(globe)
  const iris=new Mesh(new SphereGeometry(size*.68,14,10),new MeshStandardMaterial({color:irisColor[id],roughness:.34}));iris.scale.z=.13;iris.position.z=size*.59;eye.add(iris)
  const pupil=new Mesh(new SphereGeometry(size*.42,12,8),new MeshStandardMaterial({color:'#090909',roughness:.15}));pupil.scale.z=.12;pupil.position.z=size*.68;eye.add(pupil)
  const lid=new Mesh(new TorusGeometry(size*1.04,size*.14,6,24),new MeshStandardMaterial({color:id==='panda'?'#191816':id==='elephant'?'#655b50':'#514033',roughness:1}));lid.scale.y=.84;eye.add(lid)
 }
}

export function addMammalFeatures(head:Bone,id:RemodeledMammal){
 if(id!=='hippo')return
 const nostrilMaterial=new MeshStandardMaterial({color:'#4d393c',roughness:.9})
 for(const side of [-1,1]){
  const nostril=new Mesh(new SphereGeometry(.057,14,10),nostrilMaterial)
  nostril.scale.set(.9,.35,.35);nostril.position.set(side*.23,1.21-head.position.y,1.47-head.position.z);nostril.rotation.z=side*.15;head.add(nostril)
 }
}
