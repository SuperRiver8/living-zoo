import {expect,it} from 'vitest'
import {grassGeometry} from './Grass'

it('草叶有高度、弯曲和收尖的叶尖',()=>{
 const geometry=grassGeometry(),p=geometry.getAttribute('position')
 expect(p.count).toBe(64)
 expect(p.getY(6)).toBeGreaterThan(p.getY(0))
 const width=(a:number,b:number)=>Math.hypot(p.getX(a)-p.getX(b),p.getZ(a)-p.getZ(b))
 expect(width(6,7)).toBeLessThan(width(0,1))
 expect(Math.hypot(p.getX(6),p.getZ(6))).toBeGreaterThan(0)
 geometry.dispose()
})
