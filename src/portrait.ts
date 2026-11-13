import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export const point = (x: number, y: number, z: number) => new T.Vector3(x, y, z)
const ink = '#1c1337'

function paint(color: string, roughness = .84, metalness = 0) {
  const material = new T.MeshStandardMaterial({ color, roughness, metalness })
  const inkUniform = { value: 1 }
  material.userData.ink = inkUniform
  material.onBeforeCompile = shader => {
    shader.uniforms.uInk = inkUniform
    shader.fragmentShader = 'uniform float uInk;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `
      vec3 rgb = gl_FragColor.rgb;
      float light = dot(rgb, vec3(0.299, 0.587, 0.114));
      // A print-like ordered screen: every surface keeps its lighting and volume.
      vec2 pixel = floor(gl_FragCoord.xy / 1.25);
      vec2 p = mod(pixel, 4.0);
      float bayer = 0.0;
      if (p.y < 1.0) bayer = p.x < 1.0 ? 0.0 : p.x < 2.0 ? 8.0 : p.x < 3.0 ? 2.0 : 10.0;
      else if (p.y < 2.0) bayer = p.x < 1.0 ? 12.0 : p.x < 2.0 ? 4.0 : p.x < 3.0 ? 14.0 : 6.0;
      else if (p.y < 3.0) bayer = p.x < 1.0 ? 3.0 : p.x < 2.0 ? 11.0 : p.x < 3.0 ? 1.0 : 9.0;
      else bayer = p.x < 1.0 ? 15.0 : p.x < 2.0 ? 7.0 : p.x < 3.0 ? 13.0 : 5.0;
      float printed = step((bayer + 0.5) / 16.0, smoothstep(0.12, 0.93, light));
      vec3 paper = vec3(.956, .953, .918);
      vec3 ink = vec3(.065, .082, .11);
      gl_FragColor.rgb = mix(rgb, mix(ink, paper, printed), uInk);
      #include <dithering_fragment>
    `)
  }
  return material
}

export function makePortrait() {
  const root = new T.Group()
  const torso = new T.Group()
  root.add(torso)
  const head = new T.Group()
  head.position.set(0, 2.62, .04)
  torso.add(head)

  const skin = paint('#d8ac89'), warm = paint('#ac654c'), blush = paint('#bd745b')
  const hair = paint('#271b29'), lock = paint('#322431'), streak = paint('#493340')
  const black = paint(ink), frame = paint('#a67b4c', .29, .42), glint = new T.MeshBasicMaterial({ color: '#fff4d1' })
  const shirt = paint('#f1e8db'), crease = paint('#d7cbd1'), tie = paint('#241a38'), pants = paint('#34264c')
  const citron = paint('#f7ca67'), violet = paint('#745adb'), paper = paint('#fff3cf')
  const white = paint('#fff4df'), inner = paint('#4a2431')
  const mesh = (parent: T.Object3D, g: T.BufferGeometry, m: T.Material, x = 0, y = 0, z = 0) => {
    const item = new T.Mesh(g, m)
    item.position.set(x, y, z); parent.add(item); return item
  }
  const ball = (parent: T.Object3D, m: T.Material, x: number, y: number, z: number, a: number, b: number, c: number) => {
    const item = mesh(parent, new T.SphereGeometry(1, 32, 24), m, x, y, z)
    item.scale.set(a, b, c); return item
  }
  const box = (parent: T.Object3D, m: T.Material, w: number, h: number, d: number, x: number, y: number, z: number, round = .05) =>
    mesh(parent, new RoundedBoxGeometry(w, h, d, 4, round), m, x, y, z)
  const stroke = (parent: T.Object3D, m: T.Material, coords: number[][], width: number, closed = false) => {
    const path = new T.CatmullRomCurve3(coords.map(v => point(v[0], v[1], v[2])), closed)
    return mesh(parent, new T.TubeGeometry(path, 42, width, 8, closed), m)
  }
  const solid = (parent: T.Object3D, m: T.Material, coords: number[][], depth = .025) => {
    const shape = new T.Shape()
    coords.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y))
    shape.closePath()
    return mesh(parent, new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: .012, bevelSize: .02, bevelSegments: 2 }), m)
  }

  // A shaped head, with a narrower jaw, broad cheeks, and a rounded forehead.
  const face = new T.SphereGeometry(1, 64, 48)
  const vp = face.attributes.position
  for (let i = 0; i < vp.count; i++) {
    const y = vp.getY(i), x = vp.getX(i), z = vp.getZ(i)
    const jaw = 1 + Math.min(0, y) * .19
    vp.setXYZ(i, x * .94 * jaw, y * 1.045, Math.sign(z) * Math.pow(Math.abs(z), .79) * .74 + Math.min(y, 0) * .07)
  }
  face.computeVertexNormals()
  mesh(head, face, skin, 0, .79, 0)
  ball(torso, skin, 0, 2.55, 0, .35, .37, .34)
  for (const sign of [-1, 1]) {
    const ear = ball(head, skin, sign * .88, .67, -.012, .21, .285, .145)
    ear.rotation.z = sign * -.17
    ball(head, blush, sign * .972, .68, .102, .092, .145, .032)
    ball(head, skin, sign * .896, .60, .122, .067, .106, .035)
    ball(head, blush, sign * .55, .50, .591, .15, .064, .027).rotation.z = sign * .20
  }

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
  const capMat = hair.clone(); capMat.onBeforeCompile = hair.onBeforeCompile; capMat.side = T.DoubleSide
  mesh(head, cap, capMat)
  const swoop = ball(head, lock, .27, 1.55, .39, .80, .39, .46)
  swoop.rotation.z = -.36
  ball(head, hair, -.55, 1.51, .33, .46, .37, .42).rotation.z = .44
  ball(head, hair, .806, 1.18, .23, .237, .51, .39).rotation.z = .18
  ball(head, hair, -.79, 1.11, .20, .22, .46, .32).rotation.z = -.25
  for (let i = 0; i < 4; i++) {
    const dy = i * .069
    stroke(head, streak, [[-.27, 1.71 - dy, .63 + dy * .42], [.02, 1.84 - dy, .72 + dy * .44], [.42, 1.79 - dy, .80 + dy * .10], [.72, 1.61 - dy, .75 - dy * .12], [.91, 1.39 - dy * .48, .57]], .014)
  }
  stroke(head, streak, [[-.39, 1.72, .56], [-.59, 1.67, .72], [-.78, 1.48, .64], [-.88, 1.26, .44]], .02)

  const eyes: T.Group[] = [], pupils: T.Group[] = [], brows: T.Mesh[] = []
  for (const side of [-1, 1]) {
    const x = side * .393
    const eye = new T.Group()
    eye.position.set(x, .822, .695); head.add(eye); eyes.push(eye)
    const pupil = new T.Group()
    pupil.position.set(0, 0, .04); eye.add(pupil); pupils.push(pupil)
    ball(pupil, black, 0, 0, .004, .109, .19, .037)
    ball(pupil, glint, -.031, .074, .044, .032, .036, .009)
    ball(pupil, glint, .035, -.036, .041, .012, .014, .008)
    const brow = ball(head, hair, side * .401, 1.15, .68, .198, .06, .041)
    brow.rotation.z = side * -.07
    brows.push(brow)

    const aviator = [[.08,.94,.774],[.22,1.015,.815],[.50,1.015,.79],[.746,.95,.692],[.772,.75,.684],[.643,.533,.711],[.421,.493,.765],[.213,.576,.801],[.11,.758,.801]]
    stroke(head, black, aviator.map(([a,b,c]) => [side*a,b,c]), .027, true)
    stroke(head, frame, aviator.map(([a,b,c]) => [side*a,b+.006,c+.02]), .014, true)
    stroke(head, frame, [[side*.742,.929,.714],[side*.92,.925,.557],[side*.982,.914,.26],[side*.95,.886,.071]], .022)
    ball(head, glint, side*.736, .940, .723, .033, .017, .019)
  }
  stroke(head, frame, [[-.204,.999,.814],[0,1.012,.846],[.204,.999,.814]], .015)
  stroke(head, frame, [[-.102,.845,.795],[0,.899,.845],[.102,.845,.795]], .017)
  ball(head, skin, 0, .68, .745, .137, .221, .137)
  ball(head, skin, 0, .553, .832, .173, .121, .142)
  for (const side of [-1, 1]) ball(head, warm, side * .109, .512, .853, .062, .047, .062)
  const smile = new T.Group(); smile.position.set(0, .299, .651); head.add(smile)
  stroke(smile, black, [[-.235,.044,-.008],[-.13,-.054,.068],[.012,-.083,.083],[.15,-.038,.06],[.235,.048,-.005]], .025)
  stroke(smile, blush, [[-.106,-.065,.061],[0,-.089,.074],[.105,-.062,.062]], .017)
  const mouth = ball(head, inner, 0, .282, .726, .117, .078, .018)
  const teeth = ball(head, white, 0, .312, .745, .092, .018, .011)

  // Shirt, collar, tie, cuffs, and jointed arms.
  const body = box(torso, shirt, 1.62, 1.50, .91, 0, 1.68, -.032, .36)
  body.rotation.x = -.025
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
  box(root, pants, 1.38, .40, .78, 0, .96, -.03, .15)
  for (const s of [-1, 1]) {
    box(root, pants, .565, .77, .62, s*.347, .534, -.06, .18).rotation.z = s*.046
    box(root, black, .629, .28, .87, s*.357, .17, .086, .13)
    box(root, shirt, .65, .105, .89, s*.357, .067, .102, .048)
  }
  const arms = [-1, 1].map(sign => {
    const upper = box(torso, shirt, .44, 1, .49, 0, 0, 0, .2)
    const elbow = ball(torso, shirt, 0, 0, 0, .213, .225, .23)
    const fore = box(torso, shirt, .345, 1, .37, 0, 0, 0, .16)
    const cuff = box(torso, crease, .35, .155, .38, 0, 0, 0, .058)
    const hand = new T.Group(); torso.add(hand)
    ball(hand, skin, 0, .12, 0, .155, .174, .09)
    for (let i = 0; i < 4; i++) {
      ball(hand, skin, (i - 1.5)*.069, .256 - Math.abs(i - 1.4)*.019, 0, .046, .117, .05)
    }
    ball(hand, skin, -.146 * sign, .119, .015, .057, .111, .061).rotation.z = -.47 * sign
    return { upper, elbow, fore, cuff, hand, shoulder: point(sign*.731, 2.201, -.045) }
  })
  const book = new T.Group(); torso.add(book); book.position.set(0, 1.85, .93); book.rotation.x = .19
  for (const s of [-1, 1]) {
    const leaf = new T.Group(); book.add(leaf); leaf.rotation.y = s * -.30
    box(leaf, violet, .535, .66, .085, s*.26, 0, 0, .027)
    box(leaf, paper, .47, .592, .054, s*.248, 0, -.039, .02)
    for (let i = 0; i < 4; i++) box(leaf, crease, .24 + (i%3)*.036, .014, .008, s*.25, .16 - i*.091, -.069, .004)
    box(leaf, citron, .17, .023, .01, s*.24, .06, .048, .005)
  }
  const lens = new T.Group(); torso.add(lens)
  mesh(lens, new T.TorusGeometry(.285, .051, 14, 56), citron, 0, .59, .026)
  mesh(lens, new T.CircleGeometry(.244, 48), new T.MeshBasicMaterial({ color: '#bfbdff', opacity: .23, transparent: true, depthWrite: false }), 0, .59, .036)
  box(lens, violet, .139, .377, .14, 0, .26, .022, .06)
  stroke(lens, glint, [[-.145,.62,.067],[-.123,.71,.067],[-.048,.768,.067]], .016)
  return { root, torso, head, eyes, pupils, brows, smile, mouth, teeth, arms, book, lens, shirt }
}
