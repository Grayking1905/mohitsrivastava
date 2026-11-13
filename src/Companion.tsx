import { useEffect, useRef, useState } from 'react'
import * as T from 'three'
import gsap from 'gsap'
import { makePortrait, point } from './portrait'

export type Pose = 'idle' | 'wave' | 'read' | 'explore' | 'explain' | 'think' | 'celebrate' | 'spin'
export type Gesture = { pose: Pose; sequence: number }

const poses = {
  idle: [[.89,1.64,.01],[.86,1.16,.13]],
  read: [[.73,1.52,.23],[.42,1.70,.91]],
  explain: [[1.00,1.89,.27],[1.18,2.20,.55]],
  wave: [[1.15,2.32,.13],[1.29,2.86,.30]],
  explore: [[.88,1.86,.30],[.46,2.32,.94]],
  think: [[.69,1.79,.37],[.30,2.46,.67]],
  celebrate: [[1.08,2.31,.11],[1.27,2.81,.23]],
}
const up = point(0, 1, 0)

export default function Companion(props: { gesture: Gesture; talking: boolean; reduced: boolean; onTap: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const current = useRef(props)
  const [fallback, setFallback] = useState(false)
  const pointer = useRef({ x: 0, y: 0, startX: 0, startY: 0, yaw: 0, lift: 0, down: false, moved: false, dirty: true })
  useEffect(() => { current.current = props; pointer.current.dirty = true }, [props])

  useEffect(() => {
    const mount = host.current!
    let renderer: T.WebGLRenderer
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true }) }
    catch { setFallback(true); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
    renderer.outputColorSpace = T.SRGBColorSpace
    renderer.toneMapping = T.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.append(renderer.domElement)
    const scene = new T.Scene()
    scene.add(new T.HemisphereLight('#fff2df', '#866eb8', 2.0))
    const key = new T.DirectionalLight('#fff3e6', 2.2)
    key.position.set(-3, 5, 6); scene.add(key)
    const rim = new T.DirectionalLight('#d2b5ff', 3)
    rim.position.set(3, 3, -4); scene.add(rim)
    const camera = new T.PerspectiveCamera(34, 1, .1, 30)
    const { root, torso, head, eyes, pupils, smile, mouth, teeth, arms, book, lens } = makePortrait()
    scene.add(root)
    const modes = { wave: 0, read: 0, explore: 0, explain: 0, think: 0, celebrate: 0 }
    const spin = { y: 0 }
    let sequence = -1, started = 0, visible = true
    let transition: gsap.core.Tween | undefined
    let rotation: gsap.core.Tween | undefined
    const p = pointer.current
    const gaze = { x: 0, y: 0 }
    const resize = new ResizeObserver(() => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.position.set(0, 2.49, Math.max(8.45, 5.7 / camera.aspect))
      camera.lookAt(0, 2.29, 0)
      camera.updateProjectionMatrix()
      p.dirty = true
    })
    resize.observe(mount)
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; p.dirty = true })
    observer.observe(mount)
    const lost = (event: Event) => {
      event.preventDefault()
      setFallback(true)
      renderer.setAnimationLoop(null)
    }
    renderer.domElement.addEventListener('webglcontextlost', lost)

    const elbow = point(0,0,0), wrist = point(0,0,0), target = point(0,0,0), direction = point(0,0,0)
    const segment = (part: T.Object3D, from: T.Vector3, to: T.Vector3) => {
      direction.subVectors(to, from)
      part.position.copy(from).lerp(to, .5)
      part.scale.y = direction.length() + .12
      part.quaternion.setFromUnitVectors(up, direction.normalize())
    }

    renderer.setAnimationLoop(time => {
      if (!visible || document.hidden) return
      const { gesture, talking, reduced } = current.current
      if (gesture.sequence !== sequence) {
        sequence = gesture.sequence
        started = time
        transition?.kill()
        const next = { wave: 0, read: 0, explore: 0, explain: 0, think: 0, celebrate: 0 }
        if (gesture.pose !== 'idle' && gesture.pose !== 'spin') next[gesture.pose] = 1
        if (reduced) Object.assign(modes, next)
        else transition = gsap.to(modes, { ...next, duration: .48, ease: 'power2.inOut' })
        if (gesture.pose === 'spin' && !reduced) {
          rotation?.kill()
          rotation = gsap.to(spin, { y: spin.y + 2*Math.PI, duration: 1.32, ease: 'power2.inOut' })
        }
        p.dirty = true
      }
      if (reduced && !p.dirty) return
      const t = reduced ? 0 : (time - started) / 1000
      const sway = reduced ? 0 : Math.sin(time / 730) * .028
      gaze.x = T.MathUtils.lerp(gaze.x, p.x, .14)
      gaze.y = T.MathUtils.lerp(gaze.y, p.y, .14)
      const lookX = reduced ? 0 : gaze.x, lookY = reduced ? 0 : gaze.y
      root.position.y = (reduced ? 0 : p.lift) + modes.celebrate * Math.abs(Math.sin(t * 5)) * .34 + sway
      root.rotation.y = (reduced ? 0 : spin.y + p.yaw) + lookX * .10 - .09
      torso.rotation.z = modes.explore * -.10 + modes.think * .07 + modes.celebrate * Math.sin(t * 8) * .065
      torso.position.y = sway
      head.rotation.x = modes.read * .31 + modes.explore * .08 - modes.think * .10 + lookY * .14
      head.rotation.y = modes.explore * -.23 + modes.read * Math.sin(t * 1.65) * .16 + lookX * .25
      head.rotation.z = modes.think * -.14 + modes.wave * .07
      const blink = reduced ? 1 : 1 - .96 * Math.pow(Math.max(0, Math.cos((time / 1000 + .8) * 1.35)), 165)
      eyes.forEach(eye => { eye.scale.y = blink })
      pupils.forEach(pupil => {
        pupil.position.x = lookX * .055 + modes.read * Math.sin(t * 2.4) * .055
        pupil.position.y = -.045 * modes.read - lookY * .025
      })
      smile.visible = !talking || reduced
      mouth.visible = teeth.visible = !smile.visible
      mouth.scale.y = .42 + .65 * Math.abs(Math.sin(t * 12 + Math.sin(t * 4)))
      book.visible = modes.read > .025
      book.scale.setScalar(Math.max(.001, modes.read))
      book.rotation.z = Math.sin(t * 1.35) * .06
      lens.visible = modes.explore > .025
      lens.scale.setScalar(Math.max(.001, modes.explore))

      arms.forEach((arm, index) => {
        const side = index ? 1 : -1
        const assign = (name: keyof typeof poses, mix: number) => {
          if (mix <= 0) return
          const [e, w] = poses[name]
          elbow.lerp(target.set(side*e[0],e[1],e[2]), mix)
          wrist.lerp(target.set(side*w[0],w[1],w[2]), mix)
        }
        elbow.set(0,0,0); wrist.set(0,0,0)
        assign('idle', 1)
        assign('read', modes.read)
        assign('explain', modes.explain)
        assign('celebrate', modes.celebrate)
        wrist.y += Math.sin(t * 5 + side) * (.17*modes.explain + .13*modes.celebrate)
        if (index) {
          assign('wave', modes.wave); assign('explore', modes.explore); assign('think', modes.think)
          wrist.x += Math.sin(t * 11) * .20 * modes.wave
          lens.position.copy(wrist); lens.rotation.z = -.14 + Math.sin(t * 2) * .12
        }
        segment(arm.upper, arm.shoulder, elbow)
        arm.elbow.position.copy(elbow)
        segment(arm.fore, elbow, wrist)
        arm.cuff.position.copy(wrist).lerp(elbow, .16)
        arm.cuff.quaternion.copy(arm.fore.quaternion)
        arm.hand.position.copy(wrist)
        arm.hand.quaternion.setFromUnitVectors(up, direction.subVectors(wrist, elbow).normalize())
      })
      renderer.render(scene, camera)
      p.dirty = false
    })
    return () => {
      renderer.setAnimationLoop(null)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      resize.disconnect(); observer.disconnect()
      transition?.kill(); rotation?.kill(); gsap.killTweensOf(p)
      const materials = new Set<T.Material>()
      scene.traverse(object => {
        if (!(object instanceof T.Mesh)) return
        object.geometry.dispose()
        for (const material of [object.material].flat()) materials.add(material)
      })
      materials.forEach(material => material.dispose())
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])

  const release = (tap: boolean) => {
    const p = pointer.current
    if (tap && p.down && !p.moved) current.current.onTap()
    p.down = false
    gsap.to(p, { yaw: 0, lift: 0, duration: .46, ease: 'power3.out', overwrite: true })
  }
  return (
    <div
      ref={host}
      className="avatar-canvas"
      role="img"
      aria-label="Cartoon 3D portrait of Mohit with side-swept hair, aviator glasses, a white shirt and dark tie"
      onPointerMove={event => {
        const p = pointer.current
        const rect = event.currentTarget.getBoundingClientRect()
        p.x = T.MathUtils.clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1)
        p.y = T.MathUtils.clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1)
        if (!p.down) return
        const dx = event.clientX - p.startX, dy = event.clientY - p.startY
        p.moved ||= Math.hypot(dx, dy) > 5
        if (props.reduced) return
        p.yaw = T.MathUtils.clamp(dx * .017, -Math.PI, Math.PI)
        p.lift = T.MathUtils.clamp(-dy / 100, -.08, .59)
      }}
      onPointerDown={event => {
        if (event.button !== 0) return
        gsap.killTweensOf(pointer.current)
        Object.assign(pointer.current, { down: true, moved: false, startX: event.clientX, startY: event.clientY })
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerUp={() => release(true)}
      onPointerCancel={() => release(false)}
      onPointerLeave={() => { pointer.current.x = pointer.current.y = 0 }}
    >
      {fallback && <div className="avatar-fallback"><img src="/avatar-poster.jpg" alt="" /></div>}
    </div>
  )
}
