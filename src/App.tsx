import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowUpRight, ArrowRight, Check, Copy, Github, Linkedin, Volume2, VolumeX, Pause, Play, X, Sparkles, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { Pose, Gesture } from './Companion'
import type { Cue } from './Guide'
import ProjectTour from './ProjectTour'
import useMascotActivity from './useMascotActivity'
import { profile, projects } from './content'

const Companion = lazy(() => import('./Companion'))
gsap.registerPlugin(ScrollTrigger)
const chapters = ['home', 'about', 'work', 'play', 'collection', 'contact']
const labels = ['Hello', 'About', 'QubitLab', 'Play', 'Work', 'Contact']
const chapterCues: Record<string, Cue> = {
  home: { pose: 'idle', line: 'Hey, I’m Mohit. Come explore a few things I’ve made.' },
  about: { pose: 'read', line: 'Always learning. Usually with too many tabs open.' },
  work: { pose: 'explain', line: 'Meet QubitLab. Big quantum ideas, small experiments. Try a gate.' },
  play: { pose: 'explore', line: 'A tiny break from the serious stuff. What should I do?' },
  collection: { pose: 'think', line: 'One project, and room for the next “what if?”.' },
  contact: { pose: 'wave', line: 'Your next idea could start with a hello.' },
}
const tricks: { pose: Pose; label: string; line: string }[] = [
  { pose: 'wave', label: 'Say hello', line: 'Hello, human on the other side of the screen!' },
  { pose: 'dance', label: 'Dance', line: 'The build passed. You know what that means.' },
  { pose: 'read', label: 'Read', line: 'Just one more chapter. And one more coffee.' },
  { pose: 'explore', label: 'Investigate', line: 'Found something interesting in the details.' },
  { pose: 'panic', label: 'Break prod', line: 'It worked on my machine… okay, breathe.' },
  { pose: 'fly', label: 'Take flight', line: 'Deploying to the cloud. Literally.' },
  { pose: 'vanish', label: 'Disappear', line: 'Gone to clear my cache. Be right back.' },
  { pose: 'spin', label: 'Spin', line: 'A fresh perspective on the problem.' },
  { pose: 'sneeze', label: 'Sneeze', line: 'Ah… ah… too many bugs in the air!' },
  { pose: 'selfie', label: 'Strike a pose', line: 'New profile picture? This is my good side.' },
  { pose: 'celebrate', label: 'Celebrate', line: 'Little experiments. Big possibilities.' },
  { pose: 'think', label: 'Think', line: 'What if we tried it a different way?' },
  { pose: 'hiccup', label: 'Hiccup', line: 'A tiny interruption in the event loop.' },
  { pose: 'peekaboo', label: 'Peekaboo', line: 'Still here. Just hiding from that one bug.' },
  { pose: 'dizzy', label: 'Get dizzy', line: 'Too many tabs. Too many tabs!' },
  { pose: 'sulk', label: 'Sulk', line: 'The test failed. I need a moment.' },
  { pose: 'punch', label: 'Fight a bug', line: 'One bug down. Let’s keep going.' },
]

export default function App() {
  const { activity, wake, sleepNow } = useMascotActivity()
  const [chapter, setChapter] = useState('home')
  const [compact, setCompact] = useState(() => matchMedia('(max-width: 760px)').matches)
  const [gesture, setGesture] = useState<Gesture>({ pose: 'idle', sequence: 0 })
  const [line, setLine] = useState(chapterCues.home.line)
  const [talking, setTalking] = useState(false)
  const [voice, setVoice] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [ink, setInk] = useState(true)
  const [shirt, setShirt] = useState('#f1e8db')
  const [settings, setSettings] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [details, setDetails] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
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
    setTalking(true)
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      if (voiceRef.current) {
        const utterance = new SpeechSynthesisUtterance(next.line)
        utterance.lang = 'en-IN'; utterance.rate = 1
        utterance.onend = utterance.onerror = () => setTalking(false)
        speechSynthesis.speak(utterance)
      }
    }
    talkTimer.current = window.setTimeout(() => setTalking(false), 4200)
  }, [wake])

  useEffect(() => {
    cue(chapterCues[chapter])
    clearTimeout(resetTimer.current)
  }, [chapter, cue])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced)
    const context = gsap.context(() => {
      const mobile = compact
      if (!reduced) {
        gsap.from('.hero-title > span', { y: 90, opacity: 0, stagger: .11, duration: 1, ease: 'power3.out', clearProps: 'all' })
        gsap.utils.toArray<HTMLElement>('.about-word').forEach((word, i) => {
          gsap.fromTo(word, { opacity: .23 }, { opacity: 1, scrollTrigger: { trigger: '#about', start: `top ${75 - i * 1.1}%`, end: `top ${63 - i * 1.1}%`, scrub: true } })
        })
        if (!mobile) {
          gsap.fromTo(stage.current, { x: 0 }, { x: '-60vw', ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'top 25%', scrub: 1 } })
          gsap.to(stage.current, { x: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'top 25%', scrub: 1 } })
        }
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
      if ('speechSynthesis' in window) speechSynthesis.cancel()
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
    else if ('speechSynthesis' in window) { speechSynthesis.cancel(); setTalking(false) }
  }
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true); setCopyFailed(false)
      cue({ pose: 'celebrate', line: 'Email copied. I’m looking forward to your idea.' })
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
    if ('speechSynthesis' in window) speechSynthesis.cancel()
    const next = chapterCues[chapterRef.current]
    setGesture(g => ({ pose: next.pose, sequence: g.sequence + 1 }))
    setLine(next.line)
    sleepNow()
  }
  const project = projects[0]
  const words = 'I’m a software engineer who likes making complex ideas feel simple. I build thoughtful interfaces, explore unfamiliar problems, and learn by making things you can actually use.'.split(' ')

  return <div className={`experience chapter-${chapter}`} data-activity={activity}>
    <a className="skip-link" href="#about">Skip introduction</a>
    <header className="masthead">
      <a className="identity" href="#home"><span className="identity-symbol">m<span>✳</span></span><span><strong>{profile.name}</strong><small>Software engineer & curious human</small></span></a>
      <a className="pill contact-pill" href="#contact">Have an idea? <ArrowUpRight size={18}/></a>
    </header>

    <div ref={stage} className={`character-stage ${reduced ? 'static-stage' : ''}`} data-chapter={chapter}>
      <div className="speech" data-activity={activity}><span className="speech-label">MOHIT.EXE</span><p aria-live="polite">{displayLine}</p><span className="speech-corner"/></div>
      <div className="character-viewport" data-pose={gesture.pose} data-activity={activity}>
        <Suspense fallback={<div className="avatar-fallback"><img src="/avatar-poster.svg" alt="Loading Mohit’s 3D avatar"/></div>}>
          {!(compact && chapter === 'play') && <Companion gesture={gesture} talking={talking} reduced={reduced} ink={ink} shirtColor={shirt} closeup={chapter === 'home' || chapter === 'contact'} activity={activity} onWake={wake} onTap={() => trick(tricks[0])}/>}
        </Suspense>
      </div>
      <span className="character-hint">DRAG TO PICK ME UP <span>↔</span> HOVER TO WAKE ME</span>
    </div>

    <main>
      <section className="scene hero-scene" id="home">
        <div className="hero-topline"><span className="tiny-status"/> AN EXPLORABLE PORTFOLIO <span>VOL. 01 / 2026</span></div>
        <h1 className="hero-title"><span>Ideas into</span><span>interfaces.</span><span className="outline-word">And a little</span><span className="hero-play">play<span className="asterisk">✳</span></span></h1>
        <div className="hero-bottom"><a href="#about" className="scroll-invite"><span className="round-arrow"><ArrowDown size={21}/></span><span>Scroll to meet the human<br/><b>behind the code.</b></span></a><span className="hero-index">01 — 06</span></div>
      </section>

      <section className="scene about-scene" id="about">
        <div className="content-right">
          <div className="section-label">01 / THE HUMAN</div>
          <h2 className="about-statement">{words.map((word, i) => <span className="about-word" key={i}>{word} </span>)}</h2>
          <div className="about-foot reveal"><p>My favorite part? That moment when an idea stops being a sketch and starts responding to you.</p><a className="line-link" href={profile.github} target="_blank" rel="noreferrer">Meet me on GitHub <ArrowUpRight size={20}/></a></div>
          <div className="tool-strip reveal"><span>React</span><span>TypeScript</span><span>Three.js</span><span>Python</span><span>FastAPI</span></div>
        </div>
      </section>

      <section className="scene work-scene" id="work">
        <div className="content-right">
          <div className="section-label">02 / AN IDEA MADE REAL</div>
          <div className="work-heading"><div><span className="small-label">FEATURED PROJECT · 01</span><h2>QubitLab<span>↗</span></h2></div><button className="pill" onClick={() => setDetails(true)}>The story <ArrowUpRight size={18}/></button></div>
          <p className="work-intro">Quantum computing.<br/><span>Out of the textbook. Into your hands.</span></p>
          <div className="browser-frame reveal"><div className="browser-chrome"><span><i/><i/><i/></span><span>QubitLab / interactive preview</span><span>↗</span></div><ProjectTour onCue={cue}/></div>
          <div className="work-bottom"><p>Build a circuit. See its state.<br/>Understand what just happened.</p><a className="pill light-pill" href={project.live} target="_blank" rel="noreferrer">Launch QubitLab <ArrowUpRight size={18}/></a></div>
          <div className="project-stack">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        </div>
      </section>

      <section className="scene play-scene" id="play">
        <div className="content-right">
          <div className="section-label">03 / A SMALL DETOUR</div>
          <h2 className="display-heading">Code is serious.<br/><span>I’m not always.</span></h2>
          <p className="section-description">A few things my digital self can do.<br/>Pick a reaction, or leave me idle and watch me drift off.</p>
          <div className="play-controls">
          {compact && <div className="mobile-stage" data-activity={activity}><div className="mobile-speech"><span className="speech-label">MOHIT.EXE</span><p aria-live="polite">{displayLine}</p></div><div className="mobile-model"><Suspense fallback={<img src="/avatar-poster.svg" alt="Mohit’s illustrated avatar"/>}><Companion gesture={gesture} talking={talking} reduced={reduced} ink={ink} shirtColor={shirt} activity={activity} onWake={wake} onTap={() => trick(tricks[0])}/></Suspense></div></div>}
          <div className="trick-grid">{tricks.map(action => <button key={action.pose} aria-pressed={gesture.pose === action.pose && activity === 'awake'} onClick={() => trick(action)}><span>{action.label}</span><ArrowUpRight size={17}/></button>)}<button onClick={takeNap} aria-pressed={activity === 'asleep'}><span>Take a nap</span><span aria-hidden="true">zZ</span></button></div>
          <div className="wardrobe"><span className="small-label">A CHANGE OF SHIRT?</span><div className="swatches">{[['#f1e8db','Paper'], ['#365af0','Cobalt'], ['#f17842','Tangerine'], ['#303746','Midnight']].map(([color, name]) => <button key={color} aria-label={`${name} shirt`} aria-pressed={shirt === color && !ink} style={{ background: color }} onClick={() => { clearTimeout(resetTimer.current); setShirt(color); setInk(false); cue({ pose: 'selfie', line: `${name}. A fresh look for the next build.` }) }}/>)}</div><button className="line-link" onClick={() => setInk(!ink)}>{ink ? 'Try full color' : 'Back to ink'} <Sparkles size={16}/></button></div></div>
        </div>
      </section>

      <section className="scene collection-scene" id="collection">
        <div className="content-right">
          <div className="section-label">04 / THE WORKBENCH</div>
          <div className="collection-title"><h2>Built. Building.<br/><em>To be continued.</em></h2><span>01 PROJECT<br/>02 OPEN SLOTS</span></div>
          <button className="project-row" onClick={() => setDetails(true)}><span>01</span><strong>QubitLab</strong><span>QUANTUM LEARNING</span><ArrowUpRight/></button>
          <div className="project-row future-row"><span>02</span><strong>The next experiment</strong><span>SPACE RESERVED</span><span>+</span></div>
          <div className="project-row future-row"><span>03</span><strong>Something unexpected</strong><span>SPACE RESERVED</span><span>+</span></div>
          <p className="collection-note">More ideas are on the way. These spaces stay open until there’s something worth sharing.</p>
        </div>
      </section>

      <section className="scene contact-scene" id="contact">
        <div className="contact-content"><div className="section-label">05 / THE NEXT CHAPTER</div><h2>Good things<br/>start with<br/><em>“hello.”</em><span className="contact-star">✳</span></h2><p>A project, a question, or a wonderfully weird idea.<br/>Let’s see where it goes.</p><div className="email-actions"><a href={`mailto:${profile.email}`}>{profile.email}</a><button onClick={copyEmail} aria-label="Copy email address">{copied ? <Check size={20}/> : <Copy size={20}/>}</button></div><span className="copy-status" role="status">{copied ? 'Copied. Talk soon!' : copyFailed ? 'Select the email address to copy it.' : 'SEND A NOTE ↗ OR COPY THE ADDRESS'}</span><div className="socials"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={15}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17}/> LinkedIn <ArrowUpRight size={15}/></a></div></div>
        <footer><span>© {new Date().getFullYear()} MOHIT SRIVASTAVA</span><a href="#home">BACK TO THE TOP <ArrowUpRight size={14}/></a></footer>
      </section>
    </main>

    <nav className="chapter-nav" aria-label="Chapters">{chapters.map((id,i) => <a key={id} href={`#${id}`} aria-label={labels[i]} aria-current={chapter === id ? 'location' : undefined}><i/><span>{labels[i]}</span></a>)}</nav>
    <div className="experience-tools">
      {settings && <div className="settings-popover"><span className="small-label">MAKE YOURSELF AT HOME</span><button onClick={() => setReduced(!reduced)} aria-pressed={reduced}>{reduced ? <Play size={17}/> : <Pause size={17}/>} {reduced ? 'Enable motion' : 'Reduce motion'}</button><button onClick={() => setInk(!ink)} aria-pressed={ink}><Sparkles size={17}/>{ink ? 'Switch to full color' : 'Switch to ink'}</button><button onClick={() => { clearTimeout(resetTimer.current); cue(chapterCues[chapter]); setShirt('#f1e8db'); setInk(true) }}><RotateCcw size={17}/>Reset character</button></div>}
      {'speechSynthesis' in window && <button className="round-tool" onClick={toggleVoice} aria-label={voice ? 'Mute narration' : 'Enable narration'} aria-pressed={voice} title="Optional voice narration">{voice ? <Volume2 size={19}/> : <VolumeX size={19}/>}</button>}
      <button className="round-tool" onClick={() => setSettings(!settings)} aria-expanded={settings} aria-label="Experience settings">{settings ? <X size={19}/> : <SlidersHorizontal size={19}/>}</button>
    </div>

    {details && <dialog ref={dialog} className="case-dialog" aria-labelledby="case-title" onCancel={() => setDetails(false)} onClick={e => { if (e.target === e.currentTarget) setDetails(false) }}><div className="case-body"><button className="case-close round-tool" aria-label="Close project story" onClick={() => setDetails(false)}><X/></button><span className="section-label">PROJECT 01 / QUBITLAB</span><h2 id="case-title">Make the abstract<br/><em>click.</em></h2><p className="case-lead">{project.description}</p><div className="case-columns"><div><h3>The idea</h3><p>Quantum states are hard to picture in equations alone. QubitLab gives learners a space to build circuits, inspect their effects, and ask questions as they go.</p></div><div><h3>The experience</h3><p>A visual circuit builder, 3D state exploration, and an AI learning companion connect experimentation with explanation.</p></div><div><h3>The stack</h3><p>A Next.js and TypeScript interface, Three.js for spatial visualization, and FastAPI with Qiskit for the quantum side.</p></div></div><div className="case-links"><a className="pill" href={project.live} target="_blank" rel="noreferrer">Open QubitLab <ArrowUpRight size={18}/></a><a className="line-link" href={project.repository} target="_blank" rel="noreferrer">Explore the source <ArrowRight size={18}/></a></div></div></dialog>}
  </div>
}
