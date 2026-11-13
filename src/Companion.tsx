import { useEffect, useRef, useState } from 'react'
import * as T from 'three'
import gsap from 'gsap'
import { createMascotRig } from './mascotRig'
import type { Activity } from './useMascotActivity'

export type Pose = 'idle' | 'wave' | 'read' | 'explore' | 'explain' | 'think' | 'celebrate' | 'spin' | 'dance' | 'panic' | 'fly' | 'vanish' | 'sneeze' | 'selfie' | 'hiccup' | 'peekaboo' | 'sulk' | 'punch' | 'dizzy'
export type Gesture = { pose: Pose; sequence: number }
type Props = { gesture: Gesture; talking: boolean; reduced: boolean; onTap: () => void; ink?: boolean; shirtColor?: string; closeup?: boolean; activity?: Activity; onWake?: () => void }
const emptyWeights=()=>({wave:0,read:0,explore:0,explain:0,think:0,celebrate:0,dance:0,panic:0,fly:0,vanish:0,sneeze:0,selfie:0,hiccup:0,peekaboo:0,sulk:0,punch:0,dizzy:0,sleep:0,drowsy:0,wake:0})

// The print pass is independent of the character materials, so every surface uses
// the same screen-space pattern. Alpha stays transparent around the silhouette.
const printFragment=`
uniform sampler2D source;
uniform float inkMode;
uniform float reveal;
uniform float pixelSize;
varying vec2 vUv;
float threshold(vec2 p){
  p=mod(floor(p),4.0);
  if(p.y<1.0)return (p.x<1.0?0.0:p.x<2.0?8.0:p.x<3.0?2.0:10.0)/16.0;
  if(p.y<2.0)return (p.x<1.0?12.0:p.x<2.0?4.0:p.x<3.0?14.0:6.0)/16.0;
  if(p.y<3.0)return (p.x<1.0?3.0:p.x<2.0?11.0:p.x<3.0?1.0:9.0)/16.0;
  return (p.x<1.0?15.0:p.x<2.0?7.0:p.x<3.0?13.0:5.0)/16.0;
}
void main(){
  vec4 sampleColor=texture2D(source,vUv);
  if(sampleColor.a<.01)discard;
  float screen=threshold(gl_FragCoord.xy/pixelSize);
  vec3 displayColor=pow(max(sampleColor.rgb,vec3(0.0)),vec3(1.0/2.2));
  float lum=dot(displayColor,vec3(.299,.587,.114));
  float paper=step(screen+.025,smoothstep(.09,.92,lum));
  vec3 printed=mix(vec3(.043,.048,.055),vec3(.975,.975,.953),paper);
  float visible=step(screen+.025, reveal);
  gl_FragColor=vec4(mix(displayColor,printed,inkMode),sampleColor.a*visible);
}`

export default function Companion(props: Props) {
  const host=useRef<HTMLDivElement>(null)
  const current=useRef(props)
  const [fallback,setFallback]=useState(false)
  const pointer=useRef({x:0,y:0,startX:0,startY:0,lastY:0,yaw:0,lift:0,shift:0,down:false,moved:false,touch:false,armed:false,dirty:true})
  const holdTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined)
  useEffect(()=>{current.current=props;pointer.current.dirty=true},[props])
  useEffect(()=>{
    const mount=host.current!
    let renderer:T.WebGLRenderer
    try{renderer=new T.WebGLRenderer({alpha:true,antialias:true})}catch{setFallback(true);return}
    const pixelRatio=Math.min(window.devicePixelRatio,1.5)
    renderer.setPixelRatio(pixelRatio);renderer.outputColorSpace=T.SRGBColorSpace
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05
    renderer.setClearColor(0x000000,0);renderer.domElement.setAttribute('aria-hidden','true');mount.append(renderer.domElement)
    const scene=new T.Scene()
    scene.add(new T.HemisphereLight('#fffdf6','#394659',1.4))
    const key=new T.DirectionalLight('#fffdf6',2.55);key.position.set(-3,5,6);scene.add(key)
    const fill=new T.DirectionalLight('#d7e4ff',.85);fill.position.set(4,2,5);scene.add(fill)
    const camera=new T.OrthographicCamera(-2,2,2,-2,.1,30)
    const rig=createMascotRig();scene.add(rig.root)
    const target=new T.WebGLRenderTarget(1,1,{depthBuffer:true})
    target.texture.colorSpace=T.SRGBColorSpace
    const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1)
    const postMaterial=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,
      uniforms:{source:{value:target.texture},inkMode:{value:1},reveal:{value:1},pixelSize:{value:pixelRatio}},
      vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:printFragment})
    const quad=new T.Mesh(new T.PlaneGeometry(2,2),postMaterial);postScene.add(quad)
    const weights=emptyWeights(),motion={turn:0,reveal:1,close:current.current.closeup?1:0}
    const gaze={x:0,y:0,speech:0};const p=pointer.current
    let width=1,height=1,visible=true,lastTime=0,started=0,frameStarted=0,lastKey='',lastReduced=current.current.reduced,lastClose=current.current.closeup
    let blend:gsap.core.Tween|undefined,framing:gsap.core.Tween|undefined,reaction:gsap.core.Timeline|undefined
    const resize=new ResizeObserver(()=>{
      const rect=mount.getBoundingClientRect();if(!rect.width||!rect.height)return
      width=rect.width;height=rect.height;renderer.setSize(width,height)
      target.setSize(Math.round(width*pixelRatio),Math.round(height*pixelRatio));p.dirty=true
    });resize.observe(mount)
    const intersection=new IntersectionObserver(([e])=>{visible=e.isIntersecting;p.dirty=true});intersection.observe(mount)
    const lost=(event:Event)=>{event.preventDefault();renderer.setAnimationLoop(null);renderer.domElement.style.visibility='hidden';setFallback(true)}
    renderer.domElement.addEventListener('webglcontextlost',lost)
    const look=(event:PointerEvent)=>{
      if(p.down||event.pointerType==='touch')return
      const rect=mount.getBoundingClientRect()
      p.x=T.MathUtils.clamp((event.clientX-(rect.left+rect.width/2))/Math.max(innerWidth*.4,1),-1,1)
      p.y=T.MathUtils.clamp((event.clientY-(rect.top+rect.height*.36))/Math.max(innerHeight*.4,1),-1,1)
      p.dirty=true
    }
    window.addEventListener('pointermove',look,{passive:true})
    const color=new T.Color()
    renderer.setAnimationLoop(now=>{
      if(!visible||document.hidden){lastTime=now;return}
      const {gesture,talking,reduced,ink=true,shirtColor='#e9e8df',closeup,activity='awake'}=current.current
      const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now
      const animationKey=`${gesture.sequence}/${activity}/${reduced}`
      if(animationKey!==lastKey){
        const wasReduced=lastReduced;lastReduced=reduced;lastKey=animationKey;started=now
        mount.dataset.renderedPose='transition'
        blend?.kill();reaction?.kill();reaction=undefined
        // A new command can interrupt any reaction, including halfway through a spin.
        motion.turn=T.MathUtils.euclideanModulo(motion.turn+Math.PI,2*Math.PI)-Math.PI
        if(reduced){motion.turn=0;motion.reveal=1}
        const next=emptyWeights()
        if(activity==='asleep')next.sleep=1
        else if(activity==='drowsy')next.drowsy=1
        else if(activity==='waking')next.wake=1
        else if(gesture.pose!=='idle'&&gesture.pose!=='spin')next[gesture.pose]=1
        if(reduced)Object.assign(weights,next)
        else blend=gsap.to(weights,{...next,paused:true,duration:activity==='asleep'?1.15:activity==='waking'?.38:.62,ease:activity==='waking'?'power2.out':'power3.inOut'})
        if(!reduced){
          const activePose=activity==='awake'?gesture.pose:'idle'
          reaction=gsap.timeline({paused:true})
          if(activePose==='spin')reaction.to(motion,{turn:Math.PI*2,duration:1.65,ease:'power3.inOut'},0)
          else if(Math.abs(motion.turn)>.001)reaction.to(motion,{turn:0,duration:.66,ease:'power2.out'},0)
          if(activePose==='vanish')reaction.to(motion,{reveal:0,duration:.85,ease:'power2.inOut'},0).to(motion,{reveal:1,duration:1.05,ease:'power2.inOut'},2.05)
          else if(motion.reveal<1)reaction.to(motion,{reveal:1,duration:.42,ease:'power2.out'},0)
        }
        if(wasReduced!==reduced){framing?.kill();motion.close=closeup?1:0}
        p.dirty=true
      }
      if(closeup!==lastClose){lastClose=closeup;frameStarted=now;framing?.kill();if(reduced)motion.close=closeup?1:0;else framing=gsap.to(motion,{close:closeup?1:0,paused:true,duration:1.15,ease:'power3.inOut'});p.dirty=true}
      if(reduced&&!p.dirty)return
      const t=reduced?0:(now-started)/1000, clock=reduced?0:now/1000
      if(blend&&!reduced)blend.time(Math.min(t,blend.duration()))
      if(reaction&&!reduced)reaction.time(Math.min(t,reaction.duration()))
      if(framing&&!reduced)framing.time(Math.min((now-frameStarted)/1000,framing.duration()))
      const alpha=reduced?1:1-Math.exp(-dt*8)
      gaze.x=T.MathUtils.lerp(gaze.x,p.x,alpha);gaze.y=T.MathUtils.lerp(gaze.y,p.y,alpha)
      const w=weights, sleepy=w.sleep+w.drowsy*.45
      const dance=w.dance*Math.sin(clock*6),panicking=w.panic*Math.sin(clock*15),bounce=(1-Math.cos(clock*9))/2
      const hiccup=w.hiccup*Math.pow(Math.max(0,Math.sin(t*3.6)),22)
      const sneeze=w.sneeze*(t<1.5?-Math.sin(t*3)*.12:Math.exp(-(t-1.5)*3)*Math.sin((t-1.5)*14)*.55)
      const flight=w.fly*(reduced?0:Math.sin(Math.min(t/5,1)*Math.PI))
      const waking=w.wake*(reduced?0:Math.sin(Math.min(t/1.3,1)*Math.PI))
      const breath=(reduced?0:Math.sin(clock*2))*(.015+w.sleep*.025)
      rig.root.position.set(reduced?0:p.shift,(reduced?0:p.lift)+breath+w.celebrate*bounce*.13+Math.abs(dance)*.06+hiccup*.09+flight*.4+waking*.12,0)
      rig.root.rotation.set(-flight*.18,(reduced?0:p.yaw+motion.turn)+T.MathUtils.lerp(.12,-.07,motion.close)+dance*.15+w.dizzy*Math.sin(clock*4)*.32,flight*.22+panicking*.025-(reduced?0:p.shift*.16))
      rig.body.rotation.z=dance*.045+w.sleep*.04+w.sulk*-.06
      rig.head.rotation.set(sleepy*.26+w.read*.24-w.think*.08+sneeze-waking*.16+w.peekaboo*.12+w.sulk*.14+gaze.y*.07*(1-sleepy),gaze.x*.23*(1-Math.max(sleepy,w.read,w.peekaboo))+w.read*Math.sin(clock*1.8)*.095+w.explore*.12+w.panic*Math.sin(clock*7)*.15+w.dizzy*Math.sin(clock*5)*.25,w.sleep*.12-w.think*.12+w.selfie*.1+dance*.07+w.dizzy*Math.cos(clock*5)*.13)
      const blink=reduced||sleepy>.5?1:1-.995*Math.pow(Math.max(0,Math.cos(clock*1.2)),210)
      const peek=w.peekaboo*T.MathUtils.smoothstep(Math.cos(clock*3),-.5,.45)
      rig.eyes.forEach(({pivot,open,closed,brow,side},index)=>{
        const lid=Math.max(.012,(1-w.sleep-w.drowsy*.65)*blink*(1-Math.min(.94,Math.abs(sneeze)*2))*(1-(index===0?w.selfie*.92:0)))
        open.visible=lid>.03;closed.visible=!open.visible
        open.scale.y=lid;open.scale.x=1+w.panic*.15+waking*.1
        pivot.position.x=side*.393+(gaze.x*.023+w.read*Math.sin(clock*1.8)*.025)*(1-sleepy)
        pivot.position.y=.975-gaze.y*.018*(1-sleepy)-w.read*.05-w.explore*.024
        brow.position.y=1.31+w.panic*.10+waking*.12-w.sleep*.07+(index===0?w.think*.075:0)-w.sulk*.09+w.celebrate*.035
        brow.rotation.z=side*(-.08+w.panic*.22-w.sulk*.30-w.think*.12)
      })
      const speechTarget=talking&&activity==='awake'&&!reduced?(.5+.5*Math.sin(clock*15+Math.sin(clock*4)))*.13:0
      gaze.speech=T.MathUtils.lerp(gaze.speech,speechTarget,reduced?1:1-Math.exp(-dt*22))
      const mouthWidth=.56-w.sleep*.36-w.drowsy*.14-w.panic*.30-hiccup*.25-w.sulk*.17+w.celebrate*.07-waking*.26
      const mouthOpen=.115+gaze.speech-w.read*.068-w.sleep*.055+w.sleep*Math.sin(clock*1.7)*.025+w.panic*.14+hiccup*.12-w.sulk*.091+w.celebrate*.06+waking*.15
      rig.expression(mouthWidth,Math.max(.018,mouthOpen),1-w.sleep-w.panic-w.sulk*1.9-waking)
      rig.legs.forEach(({hip,knee,side})=>{
        hip.rotation.x=w.dance*Math.sin(clock*6+side)*.22+flight*.22
        hip.rotation.z=side*(w.celebrate*.10+w.fly*.12)
        knee.rotation.x=Math.max(0,-Math.sin(clock*6+side))*.28*w.dance+flight*.35
      })
      rig.arms.forEach((arm,index)=>{
        const side=arm.side
        let sx=0,sz=side*.14,ex=-.15,wz=0
        const pose=(mix:number,x:number,z:number,e:number,wrist=0)=>{sx=T.MathUtils.lerp(sx,x,mix);sz=T.MathUtils.lerp(sz,side*z,mix);ex=T.MathUtils.lerp(ex,e,mix);wz=T.MathUtils.lerp(wz,side*wrist,mix)}
        pose(w.read,-.95,.06,-.95)
        pose(w.celebrate,-.15,2.45,-.25)
        pose(w.dance,-.25,1.5+Math.sin(clock*6+side)*.5,-.9+Math.sin(clock*6)*.3)
        pose(w.panic,-.25,2.4,-.7)
        pose(w.fly,0,1.55,-.15)
        pose(w.peekaboo,-1.65,.64,-1.06)
        pose(peek,-2.22,.04,-.52)
        pose(w.sulk,-1.0,.17,-1.45)
        pose(w.sleep,.02,.18,-.1)
        if(index===1){
          pose(w.wave,-.12,2.18+Math.sin(clock*4.5)*.045,-.25,Math.sin(clock*4.5)*.19)
          pose(w.explore,-1.91,.38,-.70,.18)
          pose(w.selfie,-1.48,.71,-1.03,-.34)
          pose(w.think,-1.88,.17,-.78)
          pose(w.sneeze,-1.1,.15,-1.85)
          const punch=Math.pow(Math.max(0,Math.sin(clock*5)),6)
          pose(w.punch,-.4-punch*1.2,.65,-.7+punch*.65)
        }else{
          pose(w.explain,-.64,1.18,-.98,.25+Math.sin(clock*3.1)*.19)
          pose(w.punch,-.85,.4,-1.6)
        }
        const reach=w.read*.30+peek*.43+(index===1?w.think*.47+w.sneeze*.37:0)
        arm.shoulder.rotation.set(sx,-side*reach,sz);arm.elbow.rotation.x=ex;arm.wrist.rotation.set(0,0,wz)
        const grip=T.MathUtils.clamp(w.read*.55+w.punch+w.sulk*.5+(index===1?w.selfie*.72+w.explore*.72+w.think*.48:0),0,1)
        const openHand=Math.max(w.wave,w.celebrate,w.panic,w.peekaboo,w.explain)
        arm.fingers.forEach(({base,middle,tip,spread},i)=>{
          // Curl along the palm's normal; no independent finger oscillation.
          const curl=grip+(1-openHand)*(1-grip)*.10
          const pointing=index===1&&i===0?w.think:0
          base.rotation.set(-(.75*curl)*(1-pointing),0,spread*(1-grip)*(.65+openHand*.35))
          middle.rotation.x=-1.05*curl*(1-pointing)
          tip.rotation.x=-.65*curl*(1-pointing)
        })
        arm.thumb.rotation.set(-.25-grip*.45,side*grip*.35,-side*(.62-grip*.26))
        arm.thumbTip.rotation.x=-grip*.75
        // Solve both arms against the book's edges, so palms follow the prop.
        if(w.read>.001){
          const target=new T.Vector3(side*.49,1.32,1.02)
          const delta=target.sub(arm.shoulder.position),distance=T.MathUtils.clamp(delta.length(),.1,1.19)
          const elbow=-Math.acos(T.MathUtils.clamp((distance*distance-.65*.65-.55*.55)/(2*.65*.55),-1,1))
          const radial=Math.hypot(delta.x,delta.z)
          const heading=Math.atan2(delta.x,delta.z)
          const angle=Math.atan2(-radial,-delta.y)-Math.atan2(.55*Math.sin(elbow),.65+.55*Math.cos(elbow))
          arm.shoulder.rotation.x=T.MathUtils.lerp(sx,angle,w.read)
          arm.shoulder.rotation.y=T.MathUtils.lerp(-side*reach,heading,w.read)
          arm.shoulder.rotation.z=T.MathUtils.lerp(sz,0,w.read)
          arm.elbow.rotation.x=T.MathUtils.lerp(ex,elbow,w.read)
          arm.wrist.rotation.x=2.2*w.read
          arm.wrist.rotation.y=side*.65*w.read
        }
      })
      rig.book.visible=w.read>.03;rig.book.scale.setScalar(Math.max(.001,w.read));rig.book.rotation.z=Math.sin(clock*1.4)*.015*w.read
      const pageTurn=T.MathUtils.smoothstep(Math.cos(clock*1.05),.75,1)
      rig.turningPage.rotation.y=-.2-Math.PI*pageTurn
      rig.turningPage.visible=!reduced&&pageTurn>.02&&pageTurn<.98
      rig.lens.visible=w.explore>.08;rig.lens.scale.setScalar(Math.max(.001,w.explore))
      rig.phone.visible=w.selfie>.08;rig.phone.scale.setScalar(Math.max(.001,w.selfie))
      rig.shirt.color.copy(color.set(shirtColor))
      const aspect=width/height,viewHeight=Math.max(T.MathUtils.lerp(6.0,3.2,motion.close),T.MathUtils.lerp(3.3,2.7,motion.close)/aspect)
      camera.left=-viewHeight*aspect/2;camera.right=viewHeight*aspect/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2
      camera.position.set(0,T.MathUtils.lerp(1.43,2.78,motion.close),10);camera.lookAt(0,camera.position.y,0);camera.updateProjectionMatrix()
      postMaterial.uniforms.inkMode.value=ink?1:0;postMaterial.uniforms.reveal.value=motion.reveal
      renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,camera)
      renderer.setRenderTarget(null);renderer.clear();renderer.render(postScene,postCamera)
      if(reduced||!blend||blend.progress()===1)mount.dataset.renderedPose=activity==='awake'?gesture.pose:activity
      p.dirty=false
    })
    return()=>{
      renderer.setAnimationLoop(null);clearTimeout(holdTimer.current);window.removeEventListener('pointermove',look)
      renderer.domElement.removeEventListener('webglcontextlost',lost);resize.disconnect();intersection.disconnect()
      blend?.kill();framing?.kill();reaction?.kill();gsap.killTweensOf(p)
      const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>()
      scene.traverse(object=>{if(object instanceof T.SkinnedMesh)object.skeleton.dispose();if(object instanceof T.Mesh){geometries.add(object.geometry);for(const material of [object.material].flat())materials.add(material)}})
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());quad.geometry.dispose();postMaterial.dispose();target.dispose();renderer.dispose();renderer.domElement.remove()
    }
  },[])
  const release=(tap:boolean)=>{
    clearTimeout(holdTimer.current)
    const p=pointer.current
    if(tap&&p.down&&!p.moved)current.current.onTap()
    p.down=p.armed=false
    gsap.to(p,{yaw:0,lift:0,shift:0,duration:current.current.reduced?0:1.05,ease:'elastic.out(1,.48)',overwrite:true,onUpdate:()=>{p.dirty=true}})
  }
  const sleeping=props.activity==='asleep'
  return <div ref={host} className="avatar-canvas" data-activity={props.activity??'awake'} role="img" aria-label={`Interactive cartoon portfolio guide${sleeping?', sleeping; move the pointer or press a key to wake him':''}. Character actions are available in the Play section.`}
    onPointerEnter={()=>current.current.onWake?.()}
    onPointerMove={event=>{
      const p=pointer.current;if(!p.down)return
      const dx=event.clientX-p.startX,dy=event.clientY-p.startY
      p.moved||=Math.hypot(dx,dy)>6
      if(p.touch&&!p.armed){if(p.moved){clearTimeout(holdTimer.current);window.scrollBy(0,p.lastY-event.clientY)}p.lastY=event.clientY;return}
      if(props.reduced)return
      p.shift=T.MathUtils.clamp(dx/170,-.75,.75);p.lift=T.MathUtils.clamp(-dy/130,-.15,.6);p.yaw=T.MathUtils.clamp(dx*.008,-1.2,1.2)
    }}
    onPointerDown={event=>{
      if(event.button!==0)return
      current.current.onWake?.();gsap.killTweensOf(pointer.current)
      const touch=event.pointerType==='touch'
      Object.assign(pointer.current,{down:true,moved:false,startX:event.clientX,startY:event.clientY,lastY:event.clientY,touch,armed:!touch})
      if(touch)holdTimer.current=setTimeout(()=>{if(!pointer.current.moved)pointer.current.armed=true},260)
      event.currentTarget.setPointerCapture(event.pointerId)
    }} onPointerUp={()=>release(true)} onPointerCancel={()=>release(false)}>
    {sleeping&&<div className="sleep-letters" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></div>}
    {fallback&&<div className="avatar-fallback"><img src="/avatar-poster.svg" alt="Cartoon portfolio guide"/></div>}
  </div>
}

