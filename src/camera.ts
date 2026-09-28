import {distance,penById,type Animal,type Point} from './zoo'

export const movementCodes=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])
/** 移动始终沿地面，并相对于当前视线；斜向移动不叠加速度。 */
export function cameraMovement(keys:ReadonlySet<string>,forward:Point,dt:number,viewDistance:number):Point {
 const front=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'))
 const side=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))
 if(!front&&!side)return {x:0,z:0}
 const length=Math.hypot(forward.x,forward.z)||1,fx=forward.x/length,fz=forward.z/length
 const diagonal=Math.hypot(front,side),speed=Math.max(4,Math.min(30,viewDistance*.3)),step=speed*Math.min(dt,.05)/diagonal
 return {x:(fx*front-fz*side)*step,z:(fz*front+fx*side)*step}
}

function pointSegmentDistance(p:Point,a:Point,b:Point){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1)));return distance(p,{x:a.x+dx*t,z:a.z+dz*t})}
/** 在动物前侧寻找无遮挡的取景方向，避免近看按钮把镜头放进树冠。 */
export function focusAngle(animal:Animal,distance:number){const preferred=animal.heading+Math.PI/3,obstacles=penById(animal.penId).obstacles;let best=preferred,bestScore=-Infinity;for(let i=0;i<16;i++){const angle=preferred+i*Math.PI/8,eye={x:animal.pos.x+Math.sin(angle)*distance,z:animal.pos.z+Math.cos(angle)*distance};let score=12;for(const obstacle of obstacles)score=Math.min(score,pointSegmentDistance(obstacle,animal.pos,eye)-(obstacle.rock?obstacle.radius:3.5));score-=Math.abs(Math.atan2(Math.sin(angle-preferred),Math.cos(angle-preferred)))*.1;if(score>bestScore){bestScore=score;best=angle}}return best}
