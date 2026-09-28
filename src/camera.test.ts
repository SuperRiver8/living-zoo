import {expect,it} from 'vitest'
import {cameraMovement} from './camera'

it('WASD 与方向键等价，视角转向后仍沿视线前进',()=>{
 const forward={x:1,z:0}
 expect(cameraMovement(new Set(['KeyW']),forward,.02,20)).toEqual(cameraMovement(new Set(['ArrowUp']),forward,.02,20))
 expect(cameraMovement(new Set(['KeyW']),forward,.02,20).x).toBeGreaterThan(0)
 expect(cameraMovement(new Set(['KeyD']),forward,.02,20).z).toBeGreaterThan(0)
 expect(cameraMovement(new Set(['KeyW','KeyS']),forward,.02,20)).toEqual({x:0,z:0})
 expect(cameraMovement(new Set(),forward,.02,20)).toEqual({x:0,z:0})
})
it('斜走不会加速，后台长帧不会让镜头瞬移',()=>{
 const forward={x:0,z:-1},straight=cameraMovement(new Set(['KeyW']),forward,.02,20),diagonal=cameraMovement(new Set(['KeyW','KeyD']),forward,.02,20)
 expect(Math.hypot(diagonal.x,diagonal.z)).toBeCloseTo(Math.hypot(straight.x,straight.z))
 expect(cameraMovement(new Set(['KeyW']),forward,5,20)).toEqual(cameraMovement(new Set(['KeyW']),forward,.05,20))
})
