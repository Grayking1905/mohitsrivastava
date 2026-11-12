import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import gsap from 'gsap'

export type Trick = { name: 'wave' | 'jump' | 'spin'; count: number }

export default function Companion({ trick, reduced, onInteract }: { trick: Trick; reduced: boolean; onInteract: () => void }) {
  const mount = useRef<HTMLDivElement>(null)
  const controls = useRef<{ perform: (name: Trick['name']) => void } | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const host = mount.current!
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }) }
    catch { setFailed(true); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 50)
    camera.position.set(0, 2.1, 8.7)
    camera.lookAt(0, 0.35, 0)
    scene.add(new THREE.AmbientLight(0xffffff, 2.1))
    const key = new THREE.DirectionalLight(0xfff5dd, 3.5)
    key.position.set(-3, 7, 6); key.castShadow = true
    key.shadow.mapSize.set(1024, 1024); key.shadow.normalBias = 0.04
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xc7efd4, 1.5); fill.position.set(4, 3, -2); scene.add(fill)
    const green = new THREE.MeshStandardMaterial({ color: '#a6c87b', roughness: 0.65 })
    const cream = new THREE.MeshStandardMaterial({ color: '#f2f1d9', roughness: 0.72 })
    const dark = new THREE.MeshStandardMaterial({ color: '#173e32', roughness: 0.68 })
    const orange = new THREE.MeshStandardMaterial({ color: '#ec8c55', roughness: 0.55 })
    const glow = new THREE.MeshBasicMaterial({ color: '#d7f2a1' })
    const outline = new THREE.MeshBasicMaterial({ color: '#213e32', side: THREE.BackSide })
    const robot = new THREE.Group(); scene.add(robot)
    function box(parent: THREE.Object3D, size: number[], position: number[], material: THREE.Material, radius = 0.1) {
      const geometry = new RoundedBoxGeometry(size[0], size[1], size[2], 3, radius)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(position[0], position[1], position[2]); mesh.castShadow = true; mesh.receiveShadow = true
      const edge = new THREE.Mesh(geometry, outline); edge.scale.setScalar(1.018); mesh.add(edge)
      parent.add(mesh); return mesh
    }
    function sphere(parent: THREE.Object3D, r: number, position: number[], material: THREE.Material) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), material)
      mesh.position.set(position[0], position[1], position[2]); mesh.castShadow = true; parent.add(mesh); return mesh
    }
    const body = new THREE.Group(); robot.add(body)
    box(body, [1.35, 1.2, 0.85], [0, -0.35, 0], green, 0.22)
    box(body, [0.68, 0.42, 0.07], [0, -0.35, 0.45], cream, 0.08)
    // An original, modeled code emblem on the chest.
    for (const side of [-1, 1]) for (const angle of [-1, 1]) {
      const bar = box(body, [0.18, 0.045, 0.035], [side * 0.18, -0.35 + angle * 0.055, 0.5], dark, 0.015)
      bar.rotation.z = side * angle * -0.7
    }
    sphere(body, 0.055, [-0.38, -0.7, 0.44], orange)
    for (let i = 0; i < 3; i++) box(body, [0.09, 0.025, 0.03], [0.2 + i * 0.13, -0.72, 0.44], dark, 0.01)
    const head = new THREE.Group(); head.position.y = 0.85; body.add(head)
    box(head, [2.05, 1.55, 1.2], [0, 0, 0], cream, 0.32)
    box(head, [1.65, 0.95, 0.18], [0, -0.02, 0.59], dark, 0.22)
    const eyes = new THREE.Group(); head.add(eyes)
    for (const x of [-0.4, 0.4]) box(eyes, [0.22, 0.43, 0.08], [x, 0.03, 0.72], glow, 0.1)
    const smileCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.17, -0.24, 0.73), new THREE.Vector3(0, -0.38, 0.73), new THREE.Vector3(0.17, -0.24, 0.73))
    head.add(new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 16, 0.021, 8, false), glow))
    for (const x of [-1.06, 1.06]) {
      box(head, [0.18, 0.55, 0.6], [x, -0.02, 0], green, 0.08)
      sphere(head, 0.1, [x * 1.09, 0, 0], orange)
    }
    box(head, [0.09, 0.38, 0.09], [0, 0.93, 0], dark, 0.04)
    const antenna = sphere(head, 0.15, [0, 1.17, 0], orange)
    const arms: THREE.Group[] = []
    for (const side of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(side * 0.81, 0.05, 0); body.add(arm)
      sphere(arm, 0.19, [0, 0, 0], dark)
      box(arm, [0.28, 0.68, 0.35], [side * 0.08, -0.38, 0], green, 0.14)
      box(arm, [0.36, 0.33, 0.4], [side * 0.1, -0.79, 0], cream, 0.13)
      arm.rotation.z = side * 0.12; arms.push(arm)
      box(robot, [0.3, 0.4, 0.35], [side * 0.4, -1.08, 0], dark, 0.08)
      box(robot, [0.65, 0.35, 0.85], [side * 0.44, -1.35, 0.16], cream, 0.13)
    }
    robot.rotation.y = -0.22; robot.rotation.z = -0.035
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.25, 0.12, 80), new THREE.MeshStandardMaterial({ color: '#e0e6c9', roughness: 1 }))
    base.position.y = -1.62; base.receiveShadow = true; scene.add(base)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.014, 8, 100), dark)
    ring.rotation.x = Math.PI / 2; ring.position.y = -1.55; scene.add(ring)
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.12 }))
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.68; shadow.receiveShadow = true; scene.add(shadow)
    const pointer = new THREE.Vector2()
    let dragStart: number | null = null, dragging = false, dragRotation = -0.22, busy = false, visible = true
    const timelines = new Set<gsap.core.Timeline>()
    const perform = (name: Trick['name']) => {
      if (busy) return
      busy = true
      const tl = gsap.timeline({ onComplete: () => { busy = false; timelines.delete(tl) } }); timelines.add(tl)
      if (reduced) { tl.to(antenna.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.1 }).to(antenna.scale, { x: 1, y: 1, z: 1, duration: 0.1 }); return }
      if (name === 'jump') {
        tl.to(robot.scale, { y: 0.88, x: 1.08, duration: 0.16 }).to(robot.position, { y: 1.2, duration: 0.36, ease: 'power2.out' })
          .to(robot.scale, { y: 1.08, x: 0.95, duration: 0.25 }, '<').to(robot.position, { y: 0, duration: 0.4, ease: 'bounce.out' })
          .to(robot.scale, { y: 1, x: 1, duration: 0.2 }, '<')
      } else if (name === 'spin') tl.to(robot.rotation, { y: robot.rotation.y + Math.PI * 2, duration: 1.2, ease: 'power2.inOut' }).call(() => { dragRotation = robot.rotation.y })
      else tl.to(arms[1].rotation, { z: -2.4, duration: 0.3 }).to(arms[1].rotation, { z: -1.8, repeat: 5, yoyo: true, duration: 0.15 }).to(arms[1].rotation, { z: 0.12, duration: 0.3 })
    }
    controls.current = { perform }
    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1)
      if (dragStart !== null) { const delta = event.clientX - dragStart; if (Math.abs(delta) > 4) dragging = true; if (!busy) robot.rotation.y = dragRotation + delta * 0.012 }
    }
    const onDown = (event: PointerEvent) => { dragStart = event.clientX; dragging = false; host.setPointerCapture(event.pointerId) }
    const onUp = () => { if (dragStart !== null) { dragRotation = robot.rotation.y; dragStart = null; if (!dragging) onInteract() } }
    const onCancel = () => { dragStart = null; dragging = false; dragRotation = robot.rotation.y }
    host.addEventListener('pointermove', onMove); host.addEventListener('pointerdown', onDown); host.addEventListener('pointerup', onUp); host.addEventListener('pointercancel', onCancel)
    const resize = new ResizeObserver(() => { const { width, height } = host.getBoundingClientRect(); renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix() })
    resize.observe(host)
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }); visibility.observe(host)
    const render = (time: number) => {
      if (!visible || document.hidden) return
      const t = time / 1000
      if (!reduced) {
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, pointer.x * 0.22, 0.05)
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, pointer.y * 0.1, 0.05)
        body.position.y = Math.sin(t * 1.8) * 0.035
        const blink = Math.sin(t * 0.7) > 0.996 ? 0.12 : 1
        eyes.scale.y = THREE.MathUtils.lerp(eyes.scale.y, blink, 0.35)
        if (!busy) arms[0].rotation.z = -0.12 + Math.sin(t * 1.8) * 0.05
      }
      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
    const contextLost = (event: Event) => { event.preventDefault(); setFailed(true); renderer.setAnimationLoop(null) }
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    return () => {
      controls.current = null; timelines.forEach(t => t.kill()); resize.disconnect(); visibility.disconnect(); renderer.setAnimationLoop(null)
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerdown', onDown); host.removeEventListener('pointerup', onUp); host.removeEventListener('pointercancel', onCancel)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>()
      scene.traverse(obj => { if (obj instanceof THREE.Mesh) { geometries.add(obj.geometry); (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => materials.add(m)) } })
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); renderer.domElement.remove()
    }
  }, [reduced, onInteract])

  useEffect(() => { if (trick.count) controls.current?.perform(trick.name) }, [trick])
  return <div ref={mount} className="companion-canvas" role="img" aria-label="Bit, a friendly 3D green robot. Drag to rotate, or use the Wave, Jump and Spin buttons below.">{failed && <div className="robot-fallback"><img src="/favicon.svg" alt="Bit the friendly robot"/><span>Hi, I'm Bit. Let's explore!</span></div>}</div>
}
