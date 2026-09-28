import {describe,expect,it} from 'vitest'
import {BufferGeometry,Float32BufferAttribute} from 'three'
import {refineMammalShape} from './MammalDetails'

describe('哺乳动物轮廓修正',()=>{
 it('河马吻部收短且收窄，脚掌缩小',()=>{
  const geometry=new BufferGeometry()
  geometry.setAttribute('position',new Float32BufferAttribute([.3,1.1,1.6,.7,.2,1.2],3))
  refineMammalShape(geometry,'hippo','hippoGrey')
  const p=geometry.getAttribute('position')
  expect(p.getX(0)).toBeLessThan(.3)
  expect(p.getZ(0)).toBeLessThan(1.6)
  expect(p.getX(1)).toBeLessThan(.7)
 })
})
