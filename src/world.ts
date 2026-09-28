export type Point = { x: number; z: number }
export type SpeciesId = 'lion'|'tiger'|'elephant'|'giraffe'|'zebra'|'panda'|'kangaroo'|'flamingo'|'deer'|'peacock'|'parrot'|'hippo'
export type Diet = 'meat'|'grass'|'leaves'|'bamboo'|'grain'
export type Species = { id: SpeciesId; name: string; count: number; color: string; speed: number; radius: number; height: number; stride: number; aggression: number; power: number; diet: Diet; bird?: boolean }
export const species: Species[] = [
  {id:'lion',name:'非洲狮',count:3,color:'#b68b54',speed:1.35,radius:1.05,height:1.62,stride:1.1,aggression:.86,power:7,diet:'meat'},
  {id:'zebra',name:'斑马',count:6,color:'#cdcbbc',speed:1.45,radius:1.05,height:1.7,stride:1.25,aggression:.14,power:4,diet:'grass'},
  {id:'giraffe',name:'长颈鹿',count:4,color:'#c5a066',speed:1.25,radius:1.5,height:5.15,stride:2.2,aggression:.1,power:7,diet:'leaves'},
  {id:'elephant',name:'非洲象',count:3,color:'#9a9990',speed:1.1,radius:2.3,height:3.65,stride:2,aggression:.35,power:12,diet:'leaves'},
  {id:'hippo',name:'河马',count:3,color:'#968b88',speed:.95,radius:1.7,height:1.7,stride:1,aggression:.72,power:10,diet:'grass'},
  {id:'flamingo',name:'火烈鸟',count:8,color:'#e4a5a3',speed:.6,radius:.48,height:1.5,stride:.62,aggression:.1,power:1,diet:'grain',bird:true},
  {id:'parrot',name:'金刚鹦鹉',count:6,color:'#c56144',speed:.7,radius:.38,height:.9,stride:.33,aggression:.15,power:.6,diet:'grain',bird:true},
  {id:'peacock',name:'孔雀',count:4,color:'#366f75',speed:.68,radius:.65,height:1.15,stride:.53,aggression:.15,power:1.4,diet:'grain',bird:true},
  {id:'deer',name:'马鹿',count:5,color:'#ac835e',speed:1.2,radius:.9,height:2,stride:1,aggression:.15,power:3.5,diet:'grass'},
  {id:'panda',name:'大熊猫',count:3,color:'#d9d9cb',speed:.6,radius:.85,height:1,stride:.7,aggression:.3,power:5,diet:'bamboo'},
  {id:'tiger',name:'孟加拉虎',count:3,color:'#ca8c51',speed:1.3,radius:1.05,height:1.3,stride:1.15,aggression:.9,power:8,diet:'meat'},
  {id:'kangaroo',name:'袋鼠',count:5,color:'#a98363',speed:1.15,radius:.85,height:1.9,stride:1.5,aggression:.24,power:4,diet:'grass'},
]
export const info = Object.fromEntries(species.map(s=>[s.id,s])) as Record<SpeciesId,Species>
export type Pen = {id:string; species:SpeciesId; name:string; center:Point; angle:number; rx:number; rz:number; points:Point[]; gate:Point; feeders:Point[]; obstacles:(Point & {radius:number; rock:boolean})[]; color:string}
export const roadPoint = (a:number):Point => ({x:Math.sin(a)*53,z:Math.cos(a)*46})
export const pens:Pen[] = species.map((s,i)=>{
  const angle=Math.PI+i*Math.PI/6, center={x:Math.sin(angle)*(81+i%3),z:Math.cos(angle)*(75+i%2)}
  const rx=s.id==='elephant'?20:s.id==='hippo'?20:17, rz=s.id==='elephant'||s.id==='hippo'?23:19
  const local=(x:number,z:number)=>({x:center.x+Math.cos(angle)*x+Math.sin(angle)*z,z:center.z-Math.sin(angle)*x+Math.cos(angle)*z})
  const points=Array.from({length:48},(_,k)=>{const t=k/48*Math.PI*2,r=1+.04*Math.sin(t*3+i)+.02*Math.cos(t*5-i);return local(Math.cos(t)*rx*r,Math.sin(t)*rz*r)})
  return {id:`habitat-${s.id}`,species:s.id,name:`${s.name}展区`,center,angle,rx,rz,points,gate:local(0,-rz),feeders:[local(-5,-rz+6),local(5,-rz+6)],obstacles:Array.from({length:7},(_,k)=>{const t=k/7*Math.PI*2+.3;return {...local(Math.cos(t)*rx*.73,Math.sin(t)*rz*.65),radius:k%3===0?1.7:1.1,rock:k%3===0}}),color:['#8b9463','#9b9d6d','#9fa16f','#a8a07b','#83917b','#92a68a','#729773','#829570','#7f926d','#7a916f','#899170','#9a9c78'][i]}
})
export const penById=(id:string)=>pens.find(p=>p.id===id)!
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.z-b.z)
export function insidePolygon(p:Point, poly:Point[]) {let inside=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a.z>p.z)!==(b.z>p.z))&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)inside=!inside}return inside}
export const penAt=(p:Point)=>pens.find(pen=>insidePolygon(p,pen.points))
export const baseHeight=(x:number,z:number)=>.48+Math.sin(x*.032)*Math.cos(z*.026)*.55+Math.sin(z*.065)*.13
export const waters=[{x:0,z:0,rx:29,rz:21,level:.12,penId:''},...pens.filter(p=>p.species==='hippo'||p.species==='flamingo').map(p=>({x:p.center.x,z:p.center.z+2,rx:p.species==='hippo'?10:8,rz:p.species==='hippo'?8:6,level:baseHeight(p.center.x,p.center.z)-.12,penId:p.id}))]
export const waterAt=(p:Point)=>waters.find(w=>Math.hypot((p.x-w.x)/w.rx,(p.z-w.z)/w.rz)<1)
export function terrainHeight(x:number,z:number){let y=baseHeight(x,z);for(const w of waters){const r=Math.hypot((x-w.x)/w.rx,(z-w.z)/w.rz);if(r<1.18){const depth=w.penId.includes('flamingo')?.25:1.2;y=Math.min(y,w.level-depth+Math.max(0,(r-.8)/.38)*(depth+.2))}}return y}
export const swimmer=(id:SpeciesId)=>id==='hippo'||id==='flamingo'
export function walkable(p:Point,pen:Pen,radius=.5,swim=false){if(!insidePolygon(p,pen.points))return false;for(let k=0;k<8;k++){const a=k*Math.PI/4;if(!insidePolygon({x:p.x+Math.cos(a)*radius,z:p.z+Math.sin(a)*radius},pen.points))return false}if(pen.obstacles.some(o=>distance(o,p)<o.radius+radius))return false;return swim||!waterAt(p)}
export function nearestFree(p:Point,pen:Pen,radius:number,swim=false,occupied:Point[]=[]):Point|null {const free=(q:Point)=>walkable(q,pen,radius,swim)&&occupied.every(o=>distance(o,q)>radius*2+.25);if(free(p))return {...p};for(let k=0;k<700;k++){const r=.7*Math.sqrt(k+1),a=k*2.399963,q={x:p.x+Math.cos(a)*r,z:p.z+Math.sin(a)*r};if(free(q))return q}return null}
