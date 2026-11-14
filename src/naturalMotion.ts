import * as T from 'three'

// A two-bone arm with an elbow pole: the elbow bends in one plane instead
// of rotating the entire arm as a straight lever. Returned rotations are local.
export function solveArm(shoulder: T.Vector3, target: T.Vector3, pole: T.Vector3) {
  const upperLength=.65, lowerLength=.55
  const direction=target.clone().sub(shoulder)
  const distance=T.MathUtils.clamp(direction.length(),.36,1.17)
  direction.normalize()
  const outward=pole.clone().addScaledVector(direction,-pole.dot(direction)).normalize()
  const along=(upperLength**2-lowerLength**2+distance**2)/(2*distance)
  const height=Math.sqrt(Math.max(0,upperLength**2-along**2))
  const upper=direction.clone().multiplyScalar(along).addScaledVector(outward,height).normalize()
  const fore=direction.clone().multiplyScalar(distance).addScaledVector(upper,-upperLength).normalize()
  const x=fore.clone().cross(upper).normalize(), y=upper.clone().negate(), z=x.clone().cross(y).normalize()
  const shoulderRotation=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z))
  const elbow=-Math.acos(T.MathUtils.clamp(upper.dot(fore),-1,1))
  return {shoulder:shoulderRotation,elbow}
}

// Critically damped scalar spring; preserves velocity when interrupted and uses
// an analytic step so 30/60/120 Hz all converge to the same held target.
export function springStep(state:{value:number;velocity:number},target:number,dt:number,frequency=12) {
  const offset=state.value-target, c=state.velocity+frequency*offset, decay=Math.exp(-frequency*dt)
  state.value=target+(offset+c*dt)*decay
  state.velocity=(state.velocity-frequency*c*dt)*decay
  return state.value
}
