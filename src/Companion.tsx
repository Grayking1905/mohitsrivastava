import { useEffect, useRef, useState } from 'react'
import * as T from 'three'
import gsap from 'gsap'
import { makePortrait, point } from './portrait'

export type Pose = 'idle' | 'wave' | 'read' | 'explore' | 'explain' | 'think' | 'celebrate' | 'spin' | 'dance' | 'panic' | 'fly' | 'vanish' | 'sneeze' | 'selfie'
export type Gesture = { pose: Pose; sequence: number }
const poses = {
  idle: [[.89,1.64,.01],[.86,1.16,.13]], read: [[.73,1.52,.23],[.42,1.70,.91]],
  explain: [[1.00,1.89,.27],[1.18,2.20,.55]], wave: [[1.15,2.32,.13],[1.29,2.86,.30]],
  explore: [[.88,1.86,.30],[.46,2.32,.94]], think: [[.69,1.79,.37],[.30,2.46,.67]],
  celebrate: [[1.08,2.31,.11],[1.27,2.81,.23]], dance: [[1.16,1.98,.1],[1.35,2.56,.2]],
  panic: [[1.05,2.34,.1],[.77,3.36,.3]], fly: [[1.16,2.28,0],[1.80,2.55,.15]],
  selfie: [[1.0,1.9,.25],[1.3,2.55,.65]], sneeze: [[.70,1.80,.3],[.2,2.65,.8]],
}
const up = point(0, 1, 0)
type Props = { gesture: Gesture; talking: boolean; reduced: boolean; onTap: () => void; ink?: boolean; shirtColor?: string; closeup?: boolean }

export default function Companion(props: Props) {
  const host = useRef<HTMLDivElement>(null)
  const current = useRef(props)
  const [fallback, setFallback] = useState(false)
  const pointer = useRef({ x: 0, y: 0, startX: 0, startY: 0, yaw: 0, lift: 0, shift: 0, down: false, moved: false, dirty: true })
  useEffect(() => { current.current = props; pointer.current.dirty = true }, [props])

  useEffect(() => {
    const mount = host.current!
    let renderer: T.WebGLRenderer
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true }) }
    catch { setFallback(true); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.outputColorSpace = T.SRGBColorSpace
    renderer.toneMapping = T.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.append(renderer.domElement)
    const scene = new T.Scene()
    scene.add(new T.HemisphereLight('#ffffff', '#28334f', 1.15))
    const key = new T.DirectionalLight('#fff8ed', 3.1)
    key.position.set(-3, 5, 6); scene.add(key)
    const rim = new T.DirectionalLight('#cadcff', 1.5)
    rim.position.set(3, 3, -4); scene.add(rim)
    const camera = new T.PerspectiveCamera(32, 1, .1, 30)
    const { root, torso, head, eyes, pupils, brows, smile, mouth, teeth, arms, book, lens, shirt } = makePortrait()
    scene.add(root)
    const materials = new Set<T.Material>()
    scene.traverse(object => { if (object instanceof T.Mesh) for (const material of [object.material].flat()) materials.add(material) })
    const modes = { wave: 0, read: 0, explore: 0, explain: 0, think: 0, celebrate: 0, dance: 0, panic: 0, fly: 0, vanish: 0, sneeze: 0, selfie: 0 }
    const spin = { y: 0 }
    let sequence = -1, started = 0, visible = true, width = 1, height = 1, previousTime = 0
    let transition: gsap.core.Tween | undefined
    let rotation: gsap.core.Tween | undefined
    const p = pointer.current
    const gaze = { x: 0, y: 0 }
    const framing = { amount: current.current.closeup ? 1 : 0 }
    let lastCloseup = current.current.closeup
    let frameTween: gsap.core.Tween | undefined
    const resize = new ResizeObserver(() => {
      const rect = mount.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      width = rect.width; height = rect.height
      renderer.setSize(width, height)
      camera.aspect = width / height; camera.updateProjectionMatrix()
      p.dirty = true
    })
    resize.observe(mount)
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; p.dirty = true })
    observer.observe(mount)
    const lost = (event: Event) => { event.preventDefault(); setFallback(true); renderer.setAnimationLoop(null) }
    renderer.domElement.addEventListener('webglcontextlost', lost)
    const watchPointer = (event: PointerEvent) => {
      if (p.down || event.pointerType === 'touch') return
      p.x = event.clientX / window.innerWidth * 2 - 1
      p.y = event.clientY / window.innerHeight * 2 - 1
      p.dirty = true
    }
    window.addEventListener('pointermove', watchPointer, { passive: true })
    const elbow = point(0,0,0), wrist = point(0,0,0), target = point(0,0,0), direction = point(0,0,0)
    const color = new T.Color()
    const segment = (part: T.Object3D, from: T.Vector3, to: T.Vector3) => {
      direction.subVectors(to, from)
      part.position.copy(from).lerp(to, .5)
      part.scale.y = direction.length() + .12
      part.quaternion.setFromUnitVectors(up, direction.normalize())
    }
    renderer.setAnimationLoop(time => {
      if (!visible || document.hidden) { previousTime = time; return }
      const { gesture, talking, reduced, ink = true, shirtColor = '#f1e8db', closeup } = current.current
      const dt = Math.min((time - previousTime) / 1000, .05); previousTime = time
      if (closeup !== lastCloseup) {
        lastCloseup = closeup; frameTween?.kill()
        if (reduced) framing.amount = closeup ? 1 : 0
        else frameTween = gsap.to(framing, { amount: closeup ? 1 : 0, duration: .9, ease: 'power2.inOut' })
      }
      if (gesture.sequence !== sequence) {
        sequence = gesture.sequence; started = time; transition?.kill()
        const next = { wave: 0, read: 0, explore: 0, explain: 0, think: 0, celebrate: 0, dance: 0, panic: 0, fly: 0, vanish: 0, sneeze: 0, selfie: 0 }
        if (gesture.pose !== 'idle' && gesture.pose !== 'spin') next[gesture.pose] = 1
        if (reduced) Object.assign(modes, next)
        else transition = gsap.to(modes, { ...next, duration: .55, ease: 'power2.inOut' })
        if (gesture.pose === 'spin' && !reduced) { rotation?.kill(); rotation = gsap.to(spin, { y: spin.y + 2*Math.PI, duration: 1.5, ease: 'power2.inOut' }) }
        p.dirty = true
      }
      if (reduced && !p.dirty) return
      for (const material of materials) if (material.userData.ink) material.userData.ink.value = ink ? 1 : 0
      shirt.color.copy(color.set(shirtColor))
      const t = reduced ? 0 : (time - started) / 1000
      const alpha = reduced ? 1 : 1 - Math.exp(-dt * 9)
      gaze.x = T.MathUtils.lerp(gaze.x, p.x, alpha)
      gaze.y = T.MathUtils.lerp(gaze.y, p.y, alpha)
      const lookX = reduced ? 0 : gaze.x, lookY = reduced ? 0 : gaze.y
      const sway = reduced ? 0 : Math.sin(time / 900) * .018
      const dance = modes.dance * (reduced ? 0 : 1), panic = modes.panic * (reduced ? 0 : 1)
      const sneeze = modes.sneeze * (t < 1.5 ? -Math.sin(t * 4) * .13 : Math.exp(-(t-1.5)*4)*Math.sin((t-1.5)*15) * .75)
      const flight = modes.fly * (reduced ? 0 : Math.sin(Math.min(t / 4, 1) * Math.PI))
      const vanish = modes.vanish * (reduced ? 0 : Math.sin(Math.min(t / 4.8, 1) * Math.PI))
      root.scale.setScalar(Math.max(.02, 1 - vanish))
      root.position.set(p.shift + dance * Math.sin(t * 4) * .16, (reduced ? 0 : p.lift) + modes.celebrate * Math.abs(Math.sin(t * 5)) * .28 + dance * Math.abs(Math.sin(t*6))*.09 + flight * .8 + sway, 0)
      root.rotation.set(flight * -.2, (reduced ? 0 : spin.y + p.yaw) + lookX * .08 - .10 + dance * Math.sin(t*4)*.35 + modes.selfie * -.27, flight * .38 + panic * Math.sin(t*18)*.035 + (p.down ? p.shift * -.13 : 0))
      torso.rotation.z = modes.explore * -.08 + modes.think * .06 + dance * Math.sin(t * 6) * .09
      torso.position.y = sway
      head.rotation.x = modes.read * .30 + modes.explore * .07 - modes.think * .08 + lookY * .10 + sneeze
      head.rotation.y = modes.explore * -.19 + modes.read * Math.sin(t * 1.6) * .1 + lookX * .25 + panic * Math.sin(t*7)*.22
      head.rotation.z = modes.think * -.13 + modes.wave * .06 + modes.selfie * .12 + dance * Math.sin(t*6)*.12
      const blink = reduced ? 1 : 1 - .98 * Math.pow(Math.max(0, Math.cos((time / 1000 + .8) * 1.3)), 165)
      eyes.forEach((eye, i) => { eye.scale.y = blink * (1 - Math.min(.8, Math.abs(sneeze))) * (modes.selfie && i === 0 ? .18 : 1) })
      pupils.forEach(pupil => { pupil.position.x = lookX * .04 + modes.read * Math.sin(t * 2.4) * .04; pupil.position.y = -.06 * modes.read - lookY * .025 })
      brows.forEach((brow, i) => {
        const side = i === 0 ? -1 : 1
        brow.position.y = 1.15 + modes.panic*.12 + (i===0 ? modes.think*.07 : 0)
        brow.rotation.z = side * (-.07 + modes.panic*.3 - modes.think*.16)
      })
      smile.visible = !(talking || panic > .1 || sneeze > .15) || reduced
      mouth.visible = teeth.visible = !smile.visible
      mouth.scale.y = .078 * (.6 + .5 * Math.abs(Math.sin(t * 11 + Math.sin(t * 3))) + modes.panic*.7)
      book.visible = modes.read > .025; book.scale.setScalar(Math.max(.001, modes.read)); book.rotation.z = Math.sin(t*1.3)*.035
      lens.visible = modes.explore > .025; lens.scale.setScalar(Math.max(.001, modes.explore))
      arms.forEach((arm, index) => {
        const side = index ? 1 : -1
        const assign = (name: keyof typeof poses, mix: number) => {
          if (mix <= 0) return
          const [e, w] = poses[name]
          elbow.lerp(target.set(side*e[0],e[1],e[2]), mix); wrist.lerp(target.set(side*w[0],w[1],w[2]), mix)
        }
        elbow.set(0,0,0); wrist.set(0,0,0)
        assign('idle', 1); assign('read', modes.read)
        if (!index) assign('explain', modes.explain)
        assign('celebrate', modes.celebrate); assign('dance', dance); assign('panic', modes.panic); assign('fly', modes.fly)
        wrist.y += Math.sin(t * 5 + side) * (.13*modes.explain + .13*modes.celebrate) + dance*Math.sin(t*6+side)*.4
        if (index) {
          assign('wave', modes.wave); assign('explore', modes.explore); assign('think', modes.think); assign('selfie', modes.selfie); assign('sneeze', modes.sneeze)
          wrist.x += Math.sin(t * 10) * .18 * modes.wave
          lens.position.copy(wrist); lens.rotation.z = -.14 + Math.sin(t*2)*.08
        }
        segment(arm.upper, arm.shoulder, elbow); arm.elbow.position.copy(elbow); segment(arm.fore, elbow, wrist)
        arm.cuff.position.copy(wrist).lerp(elbow, .16); arm.cuff.quaternion.copy(arm.fore.quaternion)
        arm.hand.position.copy(wrist); arm.hand.quaternion.setFromUnitVectors(up, direction.subVectors(wrist, elbow).normalize())
      })
      const ratio = width / height
      const fullDistance = Math.max(8.35, 5.4 / ratio)
      const nearDistance = Math.max(5.5, 3.4 / ratio)
      camera.position.set(0, 2.55 + framing.amount * .8, T.MathUtils.lerp(fullDistance, nearDistance, framing.amount))
      camera.lookAt(0, 2.25 + framing.amount * .85, 0)
      renderer.render(scene, camera); p.dirty = false
    })
    return () => {
      renderer.setAnimationLoop(null); renderer.domElement.removeEventListener('webglcontextlost', lost)
      window.removeEventListener('pointermove', watchPointer)
      resize.disconnect(); observer.disconnect(); transition?.kill(); rotation?.kill(); frameTween?.kill(); gsap.killTweensOf(p)
      scene.traverse(object => { if (object instanceof T.Mesh) object.geometry.dispose() })
      materials.forEach(material => material.dispose()); renderer.dispose(); renderer.domElement.remove()
    }
  }, [])
  const release = (tap: boolean) => {
    const p = pointer.current
    if (tap && p.down && !p.moved) current.current.onTap()
    p.down = false
    gsap.to(p, { yaw: 0, lift: 0, shift: 0, duration: current.current.reduced ? 0 : 1.1, ease: 'elastic.out(1,.45)', overwrite: true, onUpdate: () => { p.dirty = true } })
  }
  return <div ref={host} className="avatar-canvas" role="img" aria-label="Interactive 3D cartoon of Mohit with swept hair, aviator glasses, shirt and tie. Use the Play section for keyboard-accessible gestures."
    onPointerMove={event => {
      const p = pointer.current
      if (!p.down) return
      const dx = event.clientX - p.startX, dy = event.clientY - p.startY
      p.moved ||= Math.hypot(dx, dy) > 5
      if (props.reduced) return
      p.yaw = T.MathUtils.clamp(dx * .009, -1.5, 1.5)
      p.shift = T.MathUtils.clamp(dx / 180, -.8, .8)
      p.lift = T.MathUtils.clamp(-dy / 100, -.15, .8)
    }}
    onPointerDown={event => { if (event.button !== 0) return; gsap.killTweensOf(pointer.current); Object.assign(pointer.current, { down: true, moved: false, startX: event.clientX, startY: event.clientY }); event.currentTarget.setPointerCapture(event.pointerId) }}
    onPointerUp={() => release(true)} onPointerCancel={() => release(false)}>
    {fallback && <div className="avatar-fallback"><img src="/avatar-poster.svg" alt="Mohit’s illustrated avatar"/></div>}
  </div>
}
