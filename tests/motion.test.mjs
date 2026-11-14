import test from 'node:test'
import assert from 'node:assert/strict'
import * as T from 'three'
import { solveArm, springStep } from '../src/naturalMotion.ts'

test('wave reaches its target with fixed limb lengths and a bent elbow',()=>{
  const origin=new T.Vector3(.73,1.57,-.045)
  for(let i=0;i<=100;i++){
    const target=new T.Vector3(1.12+Math.sin(i/100*Math.PI*2)*.024,2.21,.28)
    const pose=solveArm(origin,target,new T.Vector3(1,-.35,0))
    const upper=new T.Vector3(0,-.65,0).applyQuaternion(pose.shoulder)
    const fore=new T.Vector3(0,-.55,0).applyAxisAngle(new T.Vector3(1,0,0),pose.elbow).applyQuaternion(pose.shoulder)
    assert.ok(origin.clone().add(upper).add(fore).distanceTo(target)<1e-6)
    assert.ok(pose.elbow<-.1&&pose.elbow>-2.7)
    assert.ok(Math.abs(upper.length()-.65)<1e-6&&Math.abs(fore.length()-.55)<1e-6)
  }
})
test('spring is frame-rate independent and recovers after interruption',()=>{
  const results=[]
  for(const fps of [30,60,120]){
    const state={value:0,velocity:0}
    for(let i=0;i<fps;i++)springStep(state,1,1/fps,12)
    results.push(state.value)
    for(let i=0;i<fps;i++)springStep(state,-.2,1/fps,12)
    assert.ok(Number.isFinite(state.value)&&Math.abs(state.value+.2)<.001)
  }
  assert.ok(Math.max(...results)-Math.min(...results)<1e-10)
})
