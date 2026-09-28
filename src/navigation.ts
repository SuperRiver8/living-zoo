import {walkable,distance,type Pen,type Point} from './world'
export function clearPath(a:Point,b:Point,pen:Pen,r:number,swim:boolean){const n=Math.ceil(distance(a,b)/.8);for(let i=1;i<=n;i++)if(!walkable({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n},pen,r,swim))return false;return true}
export function findPath(start:Point,goal:Point,pen:Pen,r:number,swim:boolean):Point[]{
 if(clearPath(start,goal,pen,r,swim))return [goal]
 const cell=1.5,minX=pen.center.x-30,minZ=pen.center.z-30,key=(x:number,z:number)=>`${x},${z}`,grid=(p:Point)=>[Math.round((p.x-minX)/cell),Math.round((p.z-minZ)/cell)],point=(k:string)=>{const [x,z]=k.split(',').map(Number);return {x:minX+x*cell,z:minZ+z*cell}}
 const [sx,sz]=grid(start),[gx,gz]=grid(goal),first=key(sx,sz),last=key(gx,gz),open=[first],closed=new Set<string>(),cost=new Map([[first,0]]),came=new Map<string,string>()
 let end=''
 for(let count=0;open.length&&count<2000;count++){open.sort((a,b)=>(cost.get(a)!+distance(point(a),goal))-(cost.get(b)!+distance(point(b),goal)));const cur=open.shift()!;if(cur===last||distance(point(cur),goal)<cell&&clearPath(point(cur),goal,pen,r,swim)){end=cur;break}closed.add(cur);const [x,z]=cur.split(',').map(Number);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const next=key(x+dx,z+dz),p=point(next);if(closed.has(next)||!walkable(p,pen,r,swim)||!clearPath(point(cur),p,pen,r,swim))continue;const c=cost.get(cur)!+Math.hypot(dx,dz)*cell;if(c<(cost.get(next)??Infinity)){cost.set(next,c);came.set(next,cur);if(!open.includes(next))open.push(next)}}}
 if(!end)return []
 const route:Point[]=[goal];while(end!==first){route.unshift(point(end));end=came.get(end)!;if(!end)return []}const out:Point[]=[];let from=start;while(route.length){let i=route.length-1;while(i>0&&!clearPath(from,route[i],pen,r,swim))i--;from=route[i];out.push(from);route.splice(0,i+1)}return out
}
