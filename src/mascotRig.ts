import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export function createMascotRig() {
  const root = new T.Group(); root.name = 'MohitMascot'
  const body = new T.Group(); root.add(body)
  const head = new T.Group(); head.position.y = 2.03; body.add(head)
  const paint=(color:string,roughness=.84,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness})
  const skin=paint('#d8ac89')
  const lock=paint('#322431'), streak=paint('#574254'), crease=paint('#d7cbd1'), tie=paint('#241a38')
  const frame=paint('#be985f',.34,.27), rim=paint('#30242d'), citron=paint('#f7ca67')
  const glint=new T.MeshBasicMaterial({color:'#fff1cc'})
  const shirt = new T.MeshStandardMaterial({ color: '#f1e8db', roughness: .98 })
  const hair = new T.MeshStandardMaterial({ color: '#271b29', roughness: .93 })
  const beard = new T.MeshStandardMaterial({ color: '#948375', roughness: 1 })
  const ink = new T.MeshBasicMaterial({ color: '#101216' })
  const white = new T.MeshBasicMaterial({ color: '#fffdf5' })
  const inner = new T.MeshStandardMaterial({ color: '#b68772', roughness: 1 })
  const paper = new T.MeshStandardMaterial({ color: '#f3efdf', roughness: 1 })
  const blue = new T.MeshStandardMaterial({ color: '#395cd9', roughness: .85 })
  const orange = new T.MeshStandardMaterial({ color: '#efb477', roughness: .8 })
  const add = (parent: T.Object3D, geometry: T.BufferGeometry, material: T.Material, x=0,y=0,z=0) => {
    const mesh = new T.Mesh(geometry,material); mesh.position.set(x,y,z); parent.add(mesh); return mesh
  }
  const spheres=new Map<number,T.SphereGeometry>()
  const ellipsoid = (parent: T.Object3D, material: T.Material, pos: number[], scale: number[], segments=24) => {
    let geometry=spheres.get(segments)
    if(!geometry){geometry=new T.SphereGeometry(1,segments,Math.round(segments*.68));spheres.set(segments,geometry)}
    const mesh=add(parent,geometry,material,...pos as [number,number,number]); mesh.scale.set(...scale as [number,number,number]); return mesh
  }
  const tube = (parent: T.Object3D, material: T.Material, coords: number[][], radius: number) => {
    const curve=new T.CatmullRomCurve3(coords.map(p=>new T.Vector3(...p as [number,number,number])))
    return add(parent,new T.TubeGeometry(curve,32,radius,8,false),material)
  }
  const ball=(parent:T.Object3D,material:T.Material,x:number,y:number,z:number,a:number,b:number,c:number)=>ellipsoid(parent,material,[x,y,z],[a,b,c])
  const box = (parent: T.Object3D, m: T.Material, w: number, h: number, d: number, x: number, y: number, z: number, round = .05) =>
    add(parent, new RoundedBoxGeometry(w, h, d, 4, round), m, x, y, z)
  const stroke = (parent: T.Object3D, m: T.Material, coords: number[][], width: number, closed = false) => {
    const path = new T.CatmullRomCurve3(coords.map(v => new T.Vector3(v[0], v[1], v[2])), closed)
    return add(parent, new T.TubeGeometry(path, 42, width, 8, closed), m)
  }
  const solid = (parent: T.Object3D, m: T.Material, coords: number[][], depth = .025) => {
    const shape = new T.Shape()
    coords.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y))
    shape.closePath()
    return add(parent, new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: .012, bevelSize: .02, bevelSegments: 2 }), m)
  }

  // The previous portrait's collar and tie, set at the new rig's shoulder height.
  const torso=new T.Group();torso.position.y=-.65;body.add(torso)
  const shirtBody = box(torso, shirt, 1.62, 1.50, .91, 0, 1.68, -.032, .36)
  shirtBody.rotation.x = -.025
  ball(torso, shirt, 0, 2.215, -.027, .788, .37, .435)
  stroke(torso, crease, [[0,2.21,.43],[0,1.58,.45],[0,1.03,.40]], .012)
  for (let i = 0; i < 3; i++) ball(torso, crease, 0, 1.64 - i*.194, .447, .029, .029, .018)
  for (const sign of [-1, 1]) {
    const collar = solid(torso, shirt, [[0,.023],[sign*.29,.206],[sign*.55,.01],[sign*.275,-.36],[sign*.14,-.13]])
    collar.position.set(0, 2.31, .467)
    stroke(torso, crease, [[sign*.02,2.32,.496],[sign*.26,2.014,.491],[sign*.53,2.295,.448]], .013)
  }
  const knot = solid(torso, tie, [[-.144,.052],[.144,.052],[.079,-.13],[-.074,-.13]])
  knot.position.set(0, 2.24, .501)
  const tieEnd = solid(torso, tie, [[-.065,0],[.066,0],[.138,-.70],[.015,-.831],[-.132,-.709]])
  tieEnd.position.set(0, 2.116, .457)
  stroke(torso, streak, [[-.083,1.708,.496],[.088,1.815,.498]], .015)
  stroke(torso, streak, [[-.104,1.47,.491],[.105,1.60,.493]], .015)
  const pocket = solid(torso, crease, [[-.15,0],[.15,0],[.138,-.19],[0,-.23],[-.145,-.19]], .012)
  pocket.position.set(.48, 1.966, .425)
  const pin = ball(torso, citron, .53, 1.91, .461, .061, .061, .025)
  pin.rotation.z = -.19
  ellipsoid(body,skin,[0,1.91,0],[.29,.38,.30])

  const faceShape=(x:number,y:number,z:number, expansion=0)=> {
    const jaw=1+Math.min(0,y)*.19
    return [x*(.94+expansion)*jaw, .94+y*(1.045+expansion), Math.sign(z)*Math.pow(Math.abs(z),.79)*(.74+expansion)+Math.min(0,y)*.055]
  }
  const face=new T.SphereGeometry(1,64,48)
  const faceColors=new Float32Array(face.attributes.position.count*3)
  const skinTint=new T.Color('#d8ac89'), beardTint=new T.Color('#bb957e'), faceTint=new T.Color()
  for(let i=0;i<face.attributes.position.count;i++) {
    const p=face.attributes.position, originalY=p.getY(i)
    const v=faceShape(p.getX(i),originalY,p.getZ(i)); p.setXYZ(i,v[0],v[1],v[2])
    const stubble=1-T.MathUtils.smoothstep(originalY,-.52,-.08)
    faceTint.copy(skinTint).lerp(beardTint,stubble)
    faceColors.set([faceTint.r,faceTint.g,faceTint.b],i*3)
  }
  face.setAttribute('color',new T.BufferAttribute(faceColors,3))
  face.computeVertexNormals(); add(head,face,new T.MeshStandardMaterial({vertexColors:true,roughness:.98}))
  for(const side of [-1,1]) {
    ellipsoid(head,skin,[side*.88,.82,-.012],[.19,.275,.145])
    tube(head,inner,[[side*.92,.94,.105],[side*.995,.84,.135],[side*.96,.71,.11]],.023)
  }
  // Reuse the original swept hair and aviator silhouette, with the live face behind it.
  const sculpt=new T.Group();sculpt.position.y=.15;head.add(sculpt)
  // The cap is one mesh with an asymmetric hairline. The sculpted quiff overlaps it.
  const capPoints: number[] = [], capIndices: number[] = []
  const n = 84, m = 24
  for (let ring = 0; ring <= m; ring++) for (let i = 0; i <= n; i++) {
    const a = 2 * Math.PI * i / n
    const front = Math.max(0, Math.cos(a)), back = Math.max(0, -Math.cos(a))
    const tip = 1.70 - .65 * Math.pow(front, 3.8) + .60 * back + .13 * Math.sin(a) * front
    const theta = (ring / m) * tip
    capPoints.push(Math.sin(theta) * Math.sin(a) * 1.02, .83 + Math.cos(theta) * 1.10, Math.sin(theta) * Math.cos(a) * .83 - .035)
    if (ring && i) { const k = ring * (n + 1) + i; capIndices.push(k - n - 2, k - 1, k, k - n - 2, k, k - n - 1) }
  }
  const cap = new T.BufferGeometry()
  cap.setAttribute('position', new T.Float32BufferAttribute(capPoints, 3)); cap.setIndex(capIndices); cap.computeVertexNormals()
  const capMat = hair.clone(); capMat.side = T.DoubleSide
  add(sculpt, cap, capMat)
  const swoop = ball(sculpt, lock, .27, 1.55, .39, .80, .39, .46)
  swoop.rotation.z = -.36
  ball(sculpt, hair, -.55, 1.51, .33, .46, .37, .42).rotation.z = .44
  ball(sculpt, hair, .806, 1.18, .23, .237, .51, .39).rotation.z = .18
  ball(sculpt, hair, -.79, 1.11, .20, .22, .46, .32).rotation.z = -.25
  for (let i = 0; i < 4; i++) {
    const dy = i * .069
    stroke(sculpt, streak, [[-.27, 1.71 - dy, .63 + dy * .42], [.02, 1.84 - dy, .72 + dy * .44], [.42, 1.79 - dy, .80 + dy * .10], [.72, 1.61 - dy, .75 - dy * .12], [.91, 1.39 - dy * .48, .57]], .014)
  }
  stroke(sculpt, streak, [[-.39, 1.72, .56], [-.59, 1.67, .72], [-.78, 1.48, .64], [-.88, 1.26, .44]], .02)

  const eyes=[-1,1].map(side=>{
    const pivot=new T.Group();pivot.position.set(side*.393,.975,.735);head.add(pivot)
    const open=new T.Group();pivot.add(open)
    ellipsoid(open,ink,[0,0,.021],[.113,.185,.037])
    ellipsoid(open,white,[-.031,.074,.056],[.032,.036,.009])
    ellipsoid(open,white,[.035,-.036,.056],[.012,.014,.008])
    const closed=tube(pivot,ink,[[-.118,.015,.025],[0,-.038,.045],[.118,.015,.025]],.018);closed.visible=false
    const brow=ellipsoid(head,hair,[side*.401,1.31,.72],[.184,.052,.038])
    return {pivot,open,closed,brow,side}
  })
  for(const side of [-1,1]) {
    const aviator = [[.08,.94,.774],[.22,1.015,.815],[.50,1.015,.79],[.746,.95,.692],[.772,.75,.684],[.643,.533,.711],[.421,.493,.765],[.213,.576,.801],[.11,.758,.801]]
    stroke(sculpt, rim, aviator.map(([a,b,c]) => [side*a,b,c]), .027, true)
    stroke(sculpt, frame, aviator.map(([a,b,c]) => [side*a,b+.006,c+.02]), .014, true)
    stroke(sculpt, frame, [[side*.742,.929,.714],[side*.92,.925,.557],[side*.982,.914,.26],[side*.95,.886,.071]], .022)
    ball(sculpt, glint, side*.736, .940, .723, .033, .017, .019)
  }
  stroke(sculpt, frame, [[-.204,.999,.814],[0,1.012,.846],[.204,.999,.814]], .015)
  stroke(sculpt, frame, [[-.102,.845,.795],[0,.899,.845],[.102,.845,.795]], .017)
  // One softly tapered nose avoids the separate bulb and dark nostril blobs.
  const nose=ball(sculpt,skin,0,.635,.755,.105,.165,.115)
  nose.rotation.x=-.12
  // A deformable mouth strip changes continuously between smile, speech, surprise and sleep.
  const mouthGeometry=new T.BufferGeometry(), teethGeometry=new T.BufferGeometry()
  const count=25, mouthVertices=new Float32Array(count*2*3), teethVertices=new Float32Array(count*2*3), mouthIndices:number[]=[]
  for(let i=0;i<count-1;i++){const a=i*2;mouthIndices.push(a,a+1,a+2,a+1,a+3,a+2)}
  mouthGeometry.setAttribute('position',new T.BufferAttribute(mouthVertices,3));mouthGeometry.setIndex(mouthIndices)
  teethGeometry.setAttribute('position',new T.BufferAttribute(teethVertices,3));teethGeometry.setIndex(mouthIndices)
  add(head,mouthGeometry,new T.MeshBasicMaterial({color:'#141419',side:T.DoubleSide}),0,.453,.683)
  const teeth=add(head,teethGeometry,new T.MeshBasicMaterial({color:'#fffaf0',side:T.DoubleSide}),0,.453,.691)
  function expression(width:number,open:number,smile:number) {
    for(let i=0;i<count;i++){
      const u=i/(count-1)*2-1, arch=Math.sqrt(Math.max(0,1-u*u)),x=u*width/2
      const top=-smile*.063*(1-u*u),bottom=top-open*arch,z=-x*x*.59
      mouthVertices.set([x,top,z,x,bottom,z],i*6)
      teethVertices.set([x,top-.008*arch,z,x,top-Math.min(open*.19,.036)*arch,z],i*6)
    }
    mouthGeometry.attributes.position.needsUpdate=true;teethGeometry.attributes.position.needsUpdate=true
    teeth.visible=open>.06
    // The bounding volume changes with the expression; keep culling valid.
    mouthGeometry.computeBoundingSphere();teethGeometry.computeBoundingSphere()
  }
  expression(.57,.13,1)

  const arms=[-1,1].map(side=>{
    const shoulder=new T.Group();shoulder.position.set(side*.73,1.57,-.045);body.add(shoulder)
    box(shoulder,shirt,.43,.83,.47,0,-.29,0,.19)
    ellipsoid(shoulder,shirt,[0,-.60,0],[.18,.18,.19])
    const elbow=new T.Group();elbow.position.y=-.65;shoulder.add(elbow)
    box(elbow,shirt,.335,.58,.35,0,-.23,0,.15)
    box(elbow,crease,.34,.125,.36,0,-.49,0,.055)
    const wrist=new T.Group();wrist.position.set(0,-.55,0);elbow.add(wrist)
    // A flattened palm with four distinct, jointed fingers. Mirror finger lengths
    // with the thumb so the two hands are anatomically consistent.
    box(wrist,skin,.26,.245,.115,0,-.10,.012,.052)
    ellipsoid(wrist,skin,[0,.005,0],[.105,.078,.065])
    const fingerLengths=[.205,.231,.214,.169]
    const fingers=fingerLengths.map((length,i)=>{
      const finger=new T.Group();finger.position.set(side*(i-1.5)*.071,-.205,.012);wrist.add(finger)
      const radius=i===3?.027:.030
      const segment=(parent:T.Group,len:number,r:number)=>{
        const mesh=add(parent,new T.CapsuleGeometry(r,Math.max(.008,len-r*2),5,12),skin,0,-len/2,0)
        return mesh
      }
      segment(finger,length*.48,radius)
      const middle=new T.Group();middle.position.y=-length*.48;finger.add(middle)
      segment(middle,length*.30,radius*.94)
      const tip=new T.Group();tip.position.y=-length*.30;middle.add(tip)
      segment(tip,length*.22,radius*.87)
      return {base:finger,middle,tip,spread:side*(i-1.5)*.055}
    })
    const thumb=new T.Group();thumb.position.set(-side*.125,-.075,.025);wrist.add(thumb)
    ellipsoid(thumb,skin,[0,-.043,0],[.044,.073,.047])
    const thumbTip=new T.Group();thumbTip.position.y=-.09;thumb.add(thumbTip)
    add(thumbTip,new T.CapsuleGeometry(.033,.055,5,12),skin,0,-.045,0)
    return {shoulder,elbow,wrist,fingers,thumb,thumbTip,side}
  })

  const trousers=paint('#343044'),sole=paint('#ece7db'),shoe=paint('#252331')
  box(body,trousers,1.3,.40,.71,0,.25,-.03,.13)
  const legs=[-1,1].map(side=>{
    const hip=new T.Group();hip.position.set(side*.34,.22,-.03);body.add(hip)
    // One continuous trouser mesh bends over the knee, with no disconnected blocks.
    const thigh=new T.Bone();hip.add(thigh)
    const knee=new T.Bone();knee.position.y=-.68;thigh.add(knee)
    const profile=[[.01,.10],[.22,.08],[.275,0],[.275,-.18],[.25,-.40],[.225,-.62],[.225,-.73],[.23,-.86],[.20,-1.08],[.175,-1.25],[.17,-1.30],[.01,-1.31]]
    const geometry=new T.LatheGeometry(profile.slice().reverse().map(([r,y])=>new T.Vector2(r,y)),32)
    geometry.scale(1,1,1.12)
    const indices:number[]=[],weights:number[]=[]
    for(let i=0;i<geometry.attributes.position.count;i++){
      const lower=T.MathUtils.smoothstep(-geometry.attributes.position.getY(i),.48,.85)
      indices.push(0,1,0,0);weights.push(1-lower,lower,0,0)
    }
    geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4))
    geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4))
    const fabric=new T.SkinnedMesh(geometry,trousers);hip.add(fabric)
    root.updateMatrixWorld(true);fabric.bind(new T.Skeleton([thigh,knee]))
    const ankle=new T.Group();ankle.position.set(0,-.64,.06);knee.add(ankle)
    box(ankle,sole,.47,.075,.76,0,-.10,.12,.035)
    ellipsoid(ankle,shoe,[0,.015,.12],[.225,.15,.35])
    box(ankle,shoe,.37,.20,.33,0,.05,-.035,.09)
    for(let i=0;i<3;i++)tube(ankle,sole,[[-.12,.115-i*.012,.14+i*.06],[0,.14-i*.012,.15+i*.06],[.12,.115-i*.012,.14+i*.06]],.009)
    return {hip,knee,ankle,side}
  })

  const book=new T.Group();book.position.set(0,1.24,1.01);book.rotation.x=.17;body.add(book)
  for(const side of [-1,1]){
    const page=new T.Group();page.rotation.y=side*-.20;book.add(page)
    box(page,blue,.49,.62,.065,side*.245,0,0,.022)
    box(page,paper,.45,.57,.052,side*.235,.015,-.05,.015)
    for(let i=0;i<4;i++)add(page,new T.BoxGeometry(.22+(i%3)*.038,.013,.005),beard,side*.235,.16-i*.09,-.08)
    box(page,citron,.18,.025,.009,side*.245,.125,.037,.004)
  }
  const turningPage=new T.Group();turningPage.position.z=-.085;book.add(turningPage)
  box(turningPage,paper,.43,.55,.018,.225,.015,0,.008)
  for(let i=0;i<4;i++)add(turningPage,new T.BoxGeometry(.24,.011,.004),beard,.225,.17-i*.084,-.012)
  turningPage.visible=false
  const lens=new T.Group();arms[1].wrist.add(lens);lens.position.set(0,-.36,.08)
  add(lens,new T.TorusGeometry(.25,.045,12,48),orange,0,-.18,0)
  add(lens,new T.CylinderGeometry(.045,.055,.29,12),hair,0,.18,0)
  add(lens,new T.CircleGeometry(.21,32),new T.MeshBasicMaterial({color:'#b3dced',transparent:true,opacity:.17,side:T.DoubleSide,depthWrite:false}),0,-.18,0)
  tube(lens,white,[[-.14,-.14,.035],[-.11,-.083,.035],[-.055,-.058,.035]],.011)
  const phone=new T.Group();phone.position.set(0,-.22,.07);arms[1].wrist.add(phone)
  add(phone,new T.BoxGeometry(.23,.4,.045),ink)
  add(phone,new T.BoxGeometry(.19,.32,.008),blue,0,0,.026)
  ellipsoid(phone,white,[.06,.14,.033],[.015,.015,.005],16)
  book.visible=lens.visible=phone.visible=false
  root.traverse((object)=>{if(object instanceof T.Mesh){object.geometry.computeBoundingSphere()}})
  return {root,body,head,eyes,arms,legs,book,turningPage,lens,phone,shirt,expression}
}

