import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowUpRight, ArrowRight, Check, Copy, Github, Linkedin, Volume2, VolumeX, Pause, Play, X, Sparkles, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { Cue, Gesture, Pose } from './characterTypes'
import ProjectTour from './ProjectTour'
import useMascotActivity from './useMascotActivity'
import useNarration from './useNarration'
import { profile, projects } from './content'

const Companion = lazy(() => import('./Companion'))
gsap.registerPlugin(ScrollTrigger)
const toolkit = [
 {name:'React + TypeScript',area:'INTERFACES',line:'I use React and TypeScript to build interfaces that respond to what you do. In QubitLab, they work together in a Next.js app.'},
 {name:'Three.js',area:'SPATIAL EXPLORATION',line:'I use Three.js to make ideas easier to see. You can explore a quantum state in QubitLab, or try moving this avatar.'},
 {name:'Python + FastAPI',area:'BEHIND THE INTERFACE',line:'Python and FastAPI connect the interface to the calculations behind it. That’s how QubitLab runs its circuits.'},
 {name:'Qiskit',area:'QUANTUM EXPERIMENTS',line:'Qiskit is a toolkit for working with quantum circuits. In QubitLab, you can try a gate and see what it changes.'},
]
const processSteps = [
 {title:'Ask',copy:'I start by asking what’s hard to understand. With QubitLab, I wanted quantum equations to feel a little more intuitive.'},
 {title:'Build',copy:'Start with a small experiment. Let someone apply a gate and see the state change.'},
 {title:'Explain',copy:'Next, explain what just happened. Seeing a result is more useful when you know why it changed.'},
 {title:'Refine',copy:'Try it, notice what feels unclear, and improve it. Good feedback and a little room to explore go a long way.'},
]
const chapters = ['home', 'about', 'toolkit', 'work', 'process', 'play', 'collection', 'contact']
const labels = ['Hello', 'About', 'Toolkit', 'QubitLab', 'Process', 'Play', 'Work', 'Contact']
const chapterCues: Record<string, Cue> = {
  home: { pose: 'idle', line: 'Hi, I’m Mohit. Let me show you a few things I’ve built.' },
  toolkit: { pose: 'explore', line: 'Pick a tool, and I’ll show you how I use it.' },
  process: { pose: 'think', line: 'Here’s how I go from a question to something you can try. Pick a step.' },
  about: { pose: 'read', line: 'I’m always learning, usually with one too many tabs open.' },
  work: { pose: 'explain', line: 'This is QubitLab. Try a gate and see what it does to a qubit.' },
  play: { pose: 'explore', line: 'Let’s take a quick break. Pick something for me to do.' },
  collection: { pose: 'think', line: 'Here’s what I’ve built so far. I’ve left some room for the next idea.' },
  contact: { pose: 'wave', line: 'If you have an idea you’d like to talk about, I’d love to hear it.' },
}
const tricks: { pose: Pose; label: string; line: string }[] = [
  { pose: 'wave', label: 'Say hello', line: 'Hey there! Nice to meet you.' },
  { pose: 'dance', label: 'Dance', line: 'The build passed! I think that calls for a little celebration.' },
  { pose: 'read', label: 'Read', line: 'I’ll read one more chapter. Then I might need another coffee.' },
  { pose: 'explore', label: 'Investigate', line: 'Hang on, I think I found something.' },
  { pose: 'panic', label: 'Break prod', line: 'It worked on my machine. Okay, let’s take a breath.' },
  { pose: 'fly', label: 'Take flight', line: 'I’m heading to the cloud. This time, I mean it literally.' },
  { pose: 'vanish', label: 'Disappear', line: 'I’m off to clear my cache. I’ll be right back.' },
  { pose: 'spin', label: 'Spin', line: 'Let’s look at it from another angle.' },
  { pose: 'sneeze', label: 'Sneeze', line: 'Excuse me! Must be all those bugs in the air.' },
  { pose: 'selfie', label: 'Strike a pose', line: 'Time for a new profile picture? I think this is my good side.' },
  { pose: 'celebrate', label: 'Celebrate', line: 'That worked! Now let’s see what else we can do.' },
  { pose: 'think', label: 'Think', line: 'What if we tried it a different way?' },
  { pose: 'hiccup', label: 'Hiccup', line: 'Sorry, just a little hiccup.' },
  { pose: 'peekaboo', label: 'Peekaboo', line: 'I’m still here. I’m just hiding from that one bug.' },
  { pose: 'dizzy', label: 'Get dizzy', line: 'I think I’ve opened one tab too many.' },
  { pose: 'sulk', label: 'Sulk', line: 'The test failed. Give me a moment.' },
  { pose: 'punch', label: 'Fight a bug', line: 'That’s one bug fixed. Let’s keep going.' },
]

export default function App() {
  const { activity, wake, sleepNow } = useMascotActivity()
  const [chapter, setChapter] = useState('home')
  const [compact, setCompact] = useState(() => matchMedia('(max-width: 760px)').matches)
  const [gesture, setGesture] = useState<Gesture>({ pose: 'idle', sequence: 0 })
  const [line, setLine] = useState(chapterCues.home.line)
  const [talking, setTalking] = useState(false)
  const { play: playNarration, stop: stopNarration } = useNarration(setTalking)
  const [voice, setVoice] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [ink, setInk] = useState(true)
  const [shirt, setShirt] = useState('#f1e8db')
  const [tool, setTool] = useState(0)
  const [step, setStep] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const docked = !expanded && (compact || ['work','collection'].includes(chapter))
  const onLeft = ['about','process','play','collection'].includes(chapter)
  const [settings, setSettings] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [details, setDetails] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const talkTimer = useRef<number | undefined>(undefined)
  const resetTimer = useRef<number | undefined>(undefined)
  const copyTimer = useRef<number | undefined>(undefined)
  const voiceRef = useRef(false)
  const chapterRef = useRef(chapter)
  chapterRef.current = chapter
  voiceRef.current = voice

  const cue = useCallback((next: Cue, interacted = true) => {
    if (interacted) wake()
    clearTimeout(talkTimer.current)
    setGesture(g => ({ pose: next.pose, sequence: g.sequence + 1 }))
    setLine(next.line)
    if (voiceRef.current && interacted) playNarration(next.line)
    else if (interacted) {
      setTalking(true)
      talkTimer.current = window.setTimeout(() => setTalking(false), 4200)
    }
  }, [playNarration, wake])

  useEffect(() => {
    if (activity === 'asleep') { stopNarration(); setTalking(false) }
  }, [activity, stopNarration])

  useEffect(() => {
    setExpanded(false)
    cue(chapterCues[chapter])
    clearTimeout(resetTimer.current)
  }, [chapter, cue])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced)
    const context = gsap.context(() => {
      if (!reduced) {
        gsap.from('.hero-title > span', { y: 90, opacity: 0, stagger: .11, duration: 1, ease: 'power3.out', clearProps: 'all' })
        gsap.utils.toArray<HTMLElement>('.about-word').forEach((word, i) => {
          gsap.fromTo(word, { opacity: .23 }, { opacity: 1, scrollTrigger: { trigger: '#about', start: `top ${75 - i * 1.1}%`, end: `top ${63 - i * 1.1}%`, scrub: true } })
        })
        gsap.utils.toArray<HTMLElement>('.reveal').forEach(el => gsap.from(el, { y: 34, opacity: 0, duration: .7, clearProps: 'all', scrollTrigger: { trigger: el, start: 'top 94%', once: true } }))
      }
      for (const id of chapters) ScrollTrigger.create({ trigger: `#${id}`, start: 'top 48%', end: 'bottom 48%', onToggle: s => { if (s.isActive) setChapter(id) } })
    })
    return () => context.revert()
  }, [reduced, compact])

  useEffect(() => {
    const breakpoint = matchMedia('(max-width: 760px)')
    const onBreakpoint = (e: MediaQueryListEvent) => setCompact(e.matches)
    breakpoint.addEventListener('change', onBreakpoint)
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const change = (e: MediaQueryListEvent) => setReduced(e.matches)
    preference.addEventListener('change', change)
    return () => {
      breakpoint.removeEventListener('change', onBreakpoint)
      preference.removeEventListener('change', change)
      clearTimeout(talkTimer.current); clearTimeout(resetTimer.current); clearTimeout(copyTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!details) return
    lastFocus.current = document.activeElement as HTMLElement
    dialog.current?.showModal()
    const saved = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = saved; lastFocus.current?.focus() }
  }, [details])

  function trick(action: typeof tricks[number]) {
    clearTimeout(resetTimer.current)
    cue({ pose: action.pose, line: action.line })
    if (!['read', 'explore', 'think'].includes(action.pose)) resetTimer.current = window.setTimeout(() => cue(chapterCues[chapterRef.current], false), 6500)
  }
  function toggleVoice() {
    const next = !voice
    setVoice(next); voiceRef.current = next
    if (next) cue({ pose: gesture.pose, line })
    else { stopNarration(); setTalking(false) }
  }
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true); setCopyFailed(false)
      cue({ pose: 'celebrate', line: 'I’ve copied my email address. I’d love to hear what you’re working on.' })
      clearTimeout(copyTimer.current); copyTimer.current = window.setTimeout(() => setCopied(false), 2600)
    } catch { setCopyFailed(true) }
  }
  const displayLine = activity === 'asleep' ? 'Taking a tiny break. Move your mouse or press a key to wake me.' : activity === 'drowsy' ? 'Still here… just resting my eyes for a moment.' : activity === 'waking' ? 'Oh, hey! Ready for the next idea?' : line
  useLayoutEffect(() => {
    if (reduced) return
    const text = gsap.fromTo('.speech p, .mobile-speech p', { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: .4, ease: 'power2.out' })
    return () => { text.kill() }
  }, [displayLine, reduced])
  function takeNap() {
    clearTimeout(resetTimer.current); clearTimeout(talkTimer.current)
    setTalking(false)
    stopNarration()
    const next = chapterCues[chapterRef.current]
    setGesture(g => ({ pose: next.pose, sequence: g.sequence + 1 }))
    setLine(next.line)
    sleepNow()
  }
  const project = projects[0]
  const words = 'I’m a software engineer who likes making complex ideas feel simple. I build thoughtful interfaces, explore unfamiliar problems, and learn by making things you can actually use.'.split(' ')

  return <div className={`experience chapter-${chapter}`} data-activity={activity} data-narrating={voice && talking}>
    <a className="skip-link" href="#about">Skip introduction</a>
    <header className="masthead">
      <a className="identity" href="#home"><span className="identity-symbol">m<span>✳</span></span><span><strong>{profile.name}</strong><small>Software engineer & curious human</small></span></a>
      <nav className="masthead-actions" aria-label="Portfolio links"><a className="pill contact-pill" href="#contact">Have an idea? <ArrowUpRight size={18}/></a><a className="pill contact-pill blog-nav-pill" href="/blog/">Blogs <ArrowUpRight size={18}/></a></nav>
    </header>

    <div className={`character-stage adaptive-stage ${docked ? 'docked' : 'full-stage'} ${onLeft ? 'stage-left' : 'stage-right'}`} data-chapter={chapter}>
      <div className="speech" data-activity={activity}><span className="speech-label">MOHIT.EXE</span><p aria-live="polite">{displayLine}</p><span className="speech-corner"/></div>
      <div className="character-viewport" data-pose={gesture.pose} data-activity={activity}>
        <Suspense fallback={<div className="avatar-fallback"><img src="/avatar-poster.svg" alt="Loading Mohit’s 3D avatar"/></div>}>
          {!(compact && chapter === 'play') && <Companion gesture={gesture} talking={talking} reduced={reduced} ink={ink} shirtColor={shirt} closeup={docked} activity={activity} onWake={wake} onTap={() => trick(tricks[0])}/>}
        </Suspense>
      </div>
      {(docked || expanded) && <button className="avatar-size-toggle" onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Minimize character' : 'Expand character'}>{expanded ? '↙' : '↗'}</button>}
      <span className="character-hint">DRAG TO PICK ME UP <span>↔</span> HOVER TO WAKE ME</span>
    </div>

    <main>
      <section className="scene hero-scene" id="home">
        <div className="hero-topline"><span className="tiny-status"/> AN EXPLORABLE PORTFOLIO <span>VOL. 01 / 2026</span></div>
        <h1 className="hero-title"><span>Ideas into</span><span>interfaces.</span><span className="outline-word">And a little</span><span className="hero-play">play<span className="asterisk">✳</span></span></h1>
        <div className="hero-bottom"><a href="#about" className="scroll-invite"><span className="round-arrow"><ArrowDown size={21}/></span><span>Scroll to meet the human<br/><b>behind the code.</b></span></a><span className="hero-index">01 — 08</span></div>
      </section>

      <section className="scene about-scene" id="about">
        <div className="content-right">
          <div className="section-label">01 / THE HUMAN</div>
          <h2 className="about-statement">{words.map((word, i) => <span className="about-word" key={i}>{word} </span>)}</h2>
          <div className="about-foot reveal"><p>My favorite part? That moment when an idea stops being a sketch and starts responding to you.</p><a className="line-link" href={profile.github} target="_blank" rel="noreferrer">Meet me on GitHub <ArrowUpRight size={20}/></a></div>
          <div className="tool-strip reveal"><span>React</span><span>TypeScript</span><span>Three.js</span><span>Python</span><span>FastAPI</span></div>
        </div>
      </section>

      <section className="scene toolkit-scene" id="toolkit"><div className="content-left"><div className="section-label">02 / THE TOOLKIT</div><h2 className="display-heading">Different tools.<br/><span>One curious mind.</span></h2><p className="section-description">Explore the technologies behind the things I build.</p><div className="skill-tabs" role="group" aria-label="Explore technologies">{toolkit.map((item,i)=><button key={item.name} aria-pressed={tool===i} onClick={()=>{setTool(i);cue({pose:'explore',line:item.line})}}>{item.name}<ArrowUpRight size={17}/></button>)}</div><article className="skill-detail" aria-live="polite"><span className="small-label">{toolkit[tool].area}</span><h3>{toolkit[tool].name}</h3><p>{toolkit[tool].line}</p><a className="line-link" href="#work">See it in QubitLab <ArrowRight size={18}/></a></article></div></section>

      <section className="scene work-scene" id="work">
        <div className="wide-content">
          <div className="section-label">03 / AN IDEA MADE REAL</div>
          <div className="work-heading"><div><span className="small-label">FEATURED PROJECT · 01</span><h2>QubitLab<span>↗</span></h2></div><button className="pill" onClick={() => setDetails(true)}>The story <ArrowUpRight size={18}/></button></div>
          <p className="work-intro">Quantum computing.<br/><span>Out of the textbook. Into your hands.</span></p>
          <div className="browser-frame reveal"><div className="browser-chrome"><span><i/><i/><i/></span><span>QubitLab / interactive preview</span><span>↗</span></div><ProjectTour onCue={cue}/></div>
          <div className="work-bottom"><p>Build a circuit. See its state.<br/>Understand what just happened.</p><a className="pill light-pill" href={project.live} target="_blank" rel="noreferrer">Launch QubitLab <ArrowUpRight size={18}/></a></div>
          <div className="project-stack">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        </div>
      </section>

      <section className="scene process-scene" id="process"><div className="content-right"><div className="section-label">04 / HOW I THINK</div><h2 className="display-heading">A question.<br/><span>Then an experiment.</span></h2><div className="process-tabs" role="group" aria-label="Explore the process">{processSteps.map((item,i)=><button key={item.title} aria-pressed={step===i} onClick={()=>{setStep(i);cue({pose:i===2?'explain':'think',line:item.copy})}}><span>0{i+1}</span>{item.title}<ArrowUpRight size={18}/></button>)}</div><div className="process-detail" aria-live="polite"><span className="process-number">0{step+1}</span><p>{processSteps[step].copy}</p></div><a href="#play" className="line-link">Try a little experiment <ArrowRight size={18}/></a></div></section>

      <section className="scene play-scene" id="play">
        <div className="content-right">
          <div className="section-label">05 / A SMALL DETOUR</div>
          <h2 className="display-heading">Code is serious.<br/><span>I’m not always.</span></h2>
          <p className="section-description">A few things my digital self can do.<br/>Pick a reaction, or leave me idle and watch me drift off.</p>
          <div className="play-controls">
          {compact && <div className="mobile-stage" data-activity={activity}><div className="mobile-speech"><span className="speech-label">MOHIT.EXE</span><p aria-live="polite">{displayLine}</p></div><div className="mobile-model"><Suspense fallback={<img src="/avatar-poster.svg" alt="Mohit’s illustrated avatar"/>}><Companion gesture={gesture} talking={talking} reduced={reduced} ink={ink} shirtColor={shirt} activity={activity} onWake={wake} onTap={() => trick(tricks[0])}/></Suspense></div></div>}
          <div className="trick-grid">{tricks.map(action => <button key={action.pose} aria-pressed={gesture.pose === action.pose && activity === 'awake'} onClick={() => trick(action)}><span>{action.label}</span><ArrowUpRight size={17}/></button>)}<button onClick={takeNap} aria-pressed={activity === 'asleep'}><span>Take a nap</span><span aria-hidden="true">zZ</span></button></div>
          <div className="wardrobe"><span className="small-label">A CHANGE OF SHIRT?</span><div className="swatches">{[['#f1e8db','Paper',"I’ll go with the light shirt this time."], ['#365af0','Cobalt',"The cobalt blue shirt looks good."], ['#f17842','Tangerine',"Let’s brighten things up with tangerine."], ['#303746','Midnight',"I’ll try the dark blue shirt."]].map(([color, name, narration]) => <button key={color} aria-label={`${name} shirt`} aria-pressed={shirt === color && !ink} style={{ background: color }} onClick={() => { clearTimeout(resetTimer.current); setShirt(color); setInk(false); cue({ pose: 'selfie', line: narration }) }}/>)}</div><button className="line-link" onClick={() => setInk(!ink)}>{ink ? 'Try full color' : 'Back to ink'} <Sparkles size={16}/></button></div></div>
        </div>
      </section>

      <section className="scene collection-scene" id="collection">
        <div className="wide-content">
          <div className="section-label">06 / THE WORKBENCH</div>
          <div className="collection-title"><h2>Built. Building.<br/><em>To be continued.</em></h2><span>01 PROJECT<br/>02 OPEN SLOTS</span></div>
          <button className="project-row" onClick={() => setDetails(true)}><span>01</span><strong>QubitLab</strong><span>QUANTUM LEARNING</span><ArrowUpRight/></button>
          <div className="project-row future-row"><span>02</span><strong>The next experiment</strong><span>SPACE RESERVED</span><span>+</span></div>
          <div className="project-row future-row"><span>03</span><strong>Something unexpected</strong><span>SPACE RESERVED</span><span>+</span></div>
          <p className="collection-note">More ideas are on the way. These spaces stay open until there’s something worth sharing.</p>
        </div>
      </section>

      <section className="scene contact-scene" id="contact">
        <div className="contact-content"><div className="section-label">07 / THE NEXT CHAPTER</div><h2>Good things<br/>start with<br/><em>“hello.”</em><span className="contact-star">✳</span></h2><p>A project, a question, or a wonderfully weird idea.<br/>Let’s see where it goes.</p><div className="email-actions"><a href={`mailto:${profile.email}`}>{profile.email}</a><button onClick={copyEmail} aria-label="Copy email address">{copied ? <Check size={20}/> : <Copy size={20}/>}</button></div><span className="copy-status" role="status">{copied ? 'Copied. Talk soon!' : copyFailed ? 'Select the email address to copy it.' : 'SEND A NOTE ↗ OR COPY THE ADDRESS'}</span><div className="socials"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={15}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17}/> LinkedIn <ArrowUpRight size={15}/></a></div></div>
        <footer><span>© {new Date().getFullYear()} MOHIT SRIVASTAVA</span><a href="#home">BACK TO THE TOP <ArrowUpRight size={14}/></a></footer>
      </section>
    </main>

    <nav className="chapter-nav" aria-label="Chapters">{chapters.map((id,i) => <a key={id} href={`#${id}`} aria-label={labels[i]} aria-current={chapter === id ? 'location' : undefined}><i/><span>{labels[i]}</span></a>)}</nav>
    <div className="experience-tools">
      {settings && <div className="settings-popover"><span className="small-label">MAKE YOURSELF AT HOME</span><button onClick={() => setReduced(!reduced)} aria-pressed={reduced}>{reduced ? <Play size={17}/> : <Pause size={17}/>} {reduced ? 'Enable motion' : 'Reduce motion'}</button><button onClick={() => setInk(!ink)} aria-pressed={ink}><Sparkles size={17}/>{ink ? 'Switch to full color' : 'Switch to ink'}</button><button onClick={() => { clearTimeout(resetTimer.current); cue(chapterCues[chapter]); setShirt('#f1e8db'); setInk(true) }}><RotateCcw size={17}/>Reset character</button></div>}
      <button className="round-tool" onClick={toggleVoice} aria-label={voice ? 'Mute narration' : 'Enable narration'} aria-pressed={voice} title="Optional voice narration">{voice ? <Volume2 size={19}/> : <VolumeX size={19}/>}</button>
      <button className="round-tool" onClick={() => setSettings(!settings)} aria-expanded={settings} aria-label="Experience settings">{settings ? <X size={19}/> : <SlidersHorizontal size={19}/>}</button>
    </div>

    {details && <dialog ref={dialog} className="case-dialog" aria-labelledby="case-title" onCancel={() => setDetails(false)} onClick={e => { if (e.target === e.currentTarget) setDetails(false) }}><div className="case-body"><button className="case-close round-tool" aria-label="Close project story" onClick={() => setDetails(false)}><X/></button><span className="section-label">PROJECT 01 / QUBITLAB</span><h2 id="case-title">Make the abstract<br/><em>click.</em></h2><p className="case-lead">{project.description}</p><div className="case-columns"><div><h3>The idea</h3><p>Quantum states are hard to picture in equations alone. QubitLab gives learners a space to build circuits, inspect their effects, and ask questions as they go.</p></div><div><h3>The experience</h3><p>A visual circuit builder, 3D state exploration, and an AI learning companion connect experimentation with explanation.</p></div><div><h3>The stack</h3><p>A Next.js and TypeScript interface, Three.js for spatial visualization, and FastAPI with Qiskit for the quantum side.</p></div></div><div className="case-links"><a className="pill" href={project.live} target="_blank" rel="noreferrer">Open QubitLab <ArrowUpRight size={18}/></a><a className="line-link" href={project.repository} target="_blank" rel="noreferrer">Explore the source <ArrowRight size={18}/></a></div></div></dialog>}
  </div>
}
