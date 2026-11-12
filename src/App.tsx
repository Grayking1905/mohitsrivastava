import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowUpRight, ArrowRight, Github, Linkedin, Volume2, VolumeX, Pause, Play, Code2, Sparkles, Hand, RotateCw, MoveUp, Terminal, Braces, Layers, Plus, Check, Copy, Menu, X, Asterisk, Atom, Gamepad2 } from 'lucide-react'
import type { Trick } from './Companion'
import { profile, projects, futureProjectSlots } from './content'
import Game from './Game'

const Companion = lazy(() => import('./Companion'))
gsap.registerPlugin(ScrollTrigger)
const nav = [{ id: 'about', name: 'The human', number: '01' }, { id: 'work', name: 'The work', number: '02' }, { id: 'play', name: 'The playground', number: '03' }]

function QuantumPreview() {
  const [gate, setGate] = useState<'H' | 'X' | 'Z'>('H')
  return <div className="quantum-preview">
    <div className="preview-toolbar"><span><Atom size={18}/> QubitLab</span><span className="preview-tag">INTERACTIVE CONCEPT</span><span className="window-dots">● ● ●</span></div>
    <div className="preview-content">
      <div className="preview-side"><span className="mono">CIRCUIT STUDIO</span><h3>Small gates.<br/>Infinite possibilities.</h3><p>One qubit. A whole new perspective.</p><div className="gate-selector" aria-label="Choose a quantum gate">{(['H', 'X', 'Z'] as const).map(g => <button key={g} className={g === gate ? 'selected' : ''} aria-pressed={g === gate} onClick={() => setGate(g)}>{g}</button>)}</div><span className="gate-hint">{gate === 'H' ? 'HADAMARD → SUPERPOSITION' : gate === 'X' ? 'PAULI-X → BIT FLIP' : 'PAULI-Z → PHASE FLIP'}</span></div>
      <div className={`bloch-system gate-${gate}`} aria-label={gate === 'H' ? 'Equal probabilities of zero and one' : gate === 'X' ? 'Qubit flipped to one' : 'Zero state remains unchanged'}><span className="ket top">|0⟩</span><div className="bloch-sphere"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="orbit orbit-c"/><div className="sphere-axis"/><div className="state-vector"><i/></div><span className="sphere-center"/></div><span className="ket bottom">|1⟩</span><span className="bloch-label">STATE VISUALIZER</span></div>
    </div>
    <div className="circuit-line"><span>|0⟩</span><i/><b>{gate}</b><i/><span className="measurement">{gate === 'H' ? '50% |0⟩ · 50% |1⟩' : gate === 'X' ? '100% |1⟩' : '100% |0⟩'}</span></div>
  </div>
}

export default function App() {
  const [soundOn, setSoundOn] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [active, setActive] = useState('home')
  const [menu, setMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [trick, setTrick] = useState<Trick>({ name: 'wave', count: 0 })
  const [speech, setSpeech] = useState('Hey, I’m Bit. Your little tour guide.')
  const soundRef = useRef(false)
  const audio = useRef<AudioContext | null>(null)
  const main = useRef<HTMLDivElement>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const speakTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const sound = useCallback((pitch = 520) => {
    if (!soundRef.current) return
    try {
      audio.current ??= new AudioContext()
      if (audio.current.state === 'suspended') void audio.current.resume()
      const oscillator = audio.current.createOscillator(), gain = audio.current.createGain()
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(pitch, audio.current.currentTime)
      gain.gain.setValueAtTime(0.055, audio.current.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audio.current.currentTime + 0.18)
      oscillator.connect(gain); gain.connect(audio.current.destination); oscillator.start(); oscillator.stop(audio.current.currentTime + 0.2)
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
    } catch { /* Sound is an optional enhancement. */ }
  }, [])
  const doTrick = useCallback((name: Trick['name']) => {
    setTrick(previous => ({ name, count: previous.count + 1 })); sound(name === 'jump' ? 720 : 480)
    setSpeech(name === 'jump' ? 'Shipping code. Catching air.' : name === 'spin' ? 'A fresh perspective never hurts.' : 'Oh, hi there! Nice to meet you.')
    clearTimeout(speakTimer.current); speakTimer.current = setTimeout(() => setSpeech('There’s more good stuff down there. ↓'), 3500)
  }, [sound])
  const interact = useCallback(() => doTrick('jump'), [doTrick])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced)
    const context = gsap.context(() => {
      if (reduced) return
      gsap.from('.hero-reveal', { y: 35, opacity: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out', clearProps: 'all' })
      gsap.utils.toArray<HTMLElement>('.reveal').forEach(element => gsap.from(element, { y: 38, opacity: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true }, clearProps: 'all' }))
      gsap.to('.hero-sticker', { y: -12, rotation: -7, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.scroll-line', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true } })
    }, main)
    return () => context.revert()
  }, [reduced])
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id) }) }, { rootMargin: '-20% 0px -55% 0px' })
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section))
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onPreference = (event: MediaQueryListEvent) => setReduced(event.matches)
    preference.addEventListener('change', onPreference)
    return () => { observer.disconnect(); preference.removeEventListener('change', onPreference); clearTimeout(copyTimer.current); clearTimeout(speakTimer.current); void audio.current?.close() }
  }, [])
  useEffect(() => {
    if (!menu) return
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false) }
    window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close)
  }, [menu])
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyFailed(false); sound(660); clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(false), 2600) }
    catch { setCopyFailed(true) }
  }

  return <div ref={main}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Mohit Srivastava, home"><span className="brand-mark">m<span>.</span></span><span>MOHIT<br/><b>SRIVASTAVA</b></span></a>
      <nav className={menu ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">{nav.map(item => <a key={item.id} href={`#${item.id}`} onClick={() => setMenu(false)} aria-current={active === item.id ? 'location' : undefined}><span>{item.number}</span>{item.name}</a>)}</nav>
      <a className="contact-nav" href="#contact">Let’s talk <ArrowUpRight size={17}/></a>
      <button className="menu-toggle icon-button" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu}>{menu ? <X/> : <Menu/>}</button>
      <div className="scroll-line"/>
    </header>
    <main id="main">
      <section className="hero section-shell" id="home">
        <div className="hero-copy">
          <div className="eyebrow hero-reveal"><span className="status-dot"/> SOFTWARE ENGINEER · CURIOUS BY DEFAULT</div>
          <h1 className="hero-reveal">Serious<br/>about <span className="serif">code.</span><br/>Playful<br/>by <span className="serif design-word">design.<svg viewBox="0 0 330 22" aria-hidden="true"><path d="M4 15C85 0 224 0 323 10M20 20C120 11 251 10 300 15"/></svg></span></h1>
          <p className="hero-description hero-reveal">Hey, I’m Mohit. I turn complex problems into<br className="desktop-break"/> thoughtful software—with a little personality.</p>
          <div className="hero-buttons hero-reveal"><a className="button primary" href="#work">Explore my work <ArrowDown size={18}/></a><a className="text-link" href="#about">Meet the human <ArrowUpRight size={17}/></a></div>
        </div>
        <div className="hero-world hero-reveal">
          <div className="world-coordinate mono">MOHIT’S LITTLE CORNER OF THE INTERNET</div>
          <div className="speech-bubble" aria-live="polite">{speech}<Sparkles size={15}/></div>
          <div className="orbit-decoration orbit-one"/><div className="orbit-decoration orbit-two"/>
          <span className="scene-spark spark-one">✳</span><span className="scene-spark spark-two">+</span>
          <span className="floating-label code-label"><Code2 size={18}/> built with curiosity</span>
          <span className="hero-sticker">100%<br/><b>HUMAN</b><span>behind the code</span></span>
          <Suspense fallback={<div className="scene-loading"><img src="/favicon.svg" alt="Bit is getting ready"/></div>}><Companion trick={trick} reduced={reduced} onInteract={interact}/></Suspense>
          <div className="companion-controls"><span>MAKE BIT DO A THING</span><div><button onClick={() => doTrick('wave')}><Hand size={15}/> Wave</button><button onClick={() => doTrick('jump')}><MoveUp size={15}/> Jump</button><button onClick={() => doTrick('spin')}><RotateCw size={15}/> Spin</button></div></div>
          <div className="drag-note">psst… you can drag me around ↗</div>
        </div>
        <div className="hero-bottom"><a href="#about"><span className="scroll-mouse"/> SCROLL TO GET TO KNOW ME <ArrowDown size={13}/></a><span><span className="tiny-star">✳</span> A SMALL WORLD. A LOT OF POSSIBILITIES.</span></div>
      </section>

      <div className="ticker" aria-hidden="true"><div>{Array.from({ length: 4 }, (_, i) => <span key={i}>THOUGHTFUL SOFTWARE <Asterisk/> CURIOUS MIND <Asterisk/> A LITTLE PLAY <Asterisk/></span>)}</div></div>

      <section id="about" className="about-section section-shell">
        <div className="section-kicker reveal"><span>01 / THE HUMAN</span><span>A FEW THINGS ABOUT ME</span></div>
        <div className="about-grid">
          <div className="about-heading reveal"><h2>Engineer by craft.<br/><span className="serif">Explorer at heart.</span></h2><div className="human-card"><div className="human-card-top"><Terminal size={20}/><span>PLAYER_01</span><span className="status-dot"/></div><div className="human-name">Mohit<br/>Srivastava<span>↗</span></div><div className="human-card-bottom"><span>CLASS<br/><b>Software engineer</b></span><span>SUPERPOWER<br/><b>Curiosity</b></span></div><span className="card-stamp">ALWAYS<br/>LEARNING</span></div></div>
          <div className="about-copy reveal"><p className="large-copy">I like making complicated things<br className="desktop-break"/> feel <span>surprisingly simple.</span></p><p>For me, engineering is equal parts logic and imagination. It’s connecting the dots between a tricky problem, a thoughtful interface, and the code that brings it all together.</p><p>QubitLab is one expression of that curiosity: turning abstract quantum concepts into something you can see, touch, and experiment with.</p><div className="about-note"><Sparkles size={20}/><span>Good software works.<br/><b>Great software makes you want to explore.</b></span></div><a className="text-link" href={profile.github} target="_blank" rel="noreferrer">Find me where the code lives <Github size={18}/></a></div>
        </div>
        <div className="toolkit reveal"><div className="toolkit-title"><span className="mono">MY TOOLKIT</span><span>Different tools.<br/>Same builder’s mindset.</span></div><div className="toolkit-items">{[{ icon: Braces, name: 'TypeScript', label: 'THE LANGUAGE' }, { icon: Code2, name: 'React / Next.js', label: 'THE INTERFACE' }, { icon: Atom, name: 'Three.js', label: 'THE DIMENSION' }, { icon: Terminal, name: 'Python / FastAPI', label: 'THE ENGINE' }, { icon: Layers, name: 'PostgreSQL', label: 'THE MEMORY' }].map(({ icon: Icon, name, label }) => <div className="tool-item" key={name}><Icon size={24}/><span>{name}</span><small>{label}</small></div>)}</div></div>
      </section>

      <section id="work" className="work-section section-shell">
        <div className="section-kicker reveal"><span>02 / THE WORK</span><span>IDEAS, MEET REALITY.</span></div>
        <div className="section-heading reveal"><h2>A little less talk.<br/><span className="serif">A little more building.</span></h2><span className="count-note">01 PROJECT<br/>AND COUNTING ↘</span></div>
        {projects.map(project => <article className="project reveal" key={project.id}><div className="project-visual"><div className="project-visual-top"><span>FEATURED BUILD / 001</span><span><span className="status-dot"/> EXPLORE THE QUANTUM WORLD</span></div><QuantumPreview/><div className="project-visual-bottom"><span>FROM ABSTRACT THEORY TO HANDS-ON DISCOVERY</span><Atom size={25}/></div></div><div className="project-detail"><div><span className="project-kind mono">INTERACTIVE LEARNING · FULL STACK</span><h3>{project.name}<span>↗</span></h3><p>{project.description}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><div className="project-actions"><a href={project.live} target="_blank" rel="noreferrer" className="button primary">Explore QubitLab <ArrowUpRight size={18}/></a><a href={project.repository} target="_blank" rel="noreferrer" className="text-link"><Github size={17}/> View source code</a></div></div><div className="project-features"><span><Braces/> Visual circuit builder</span><span><Atom/> 3D quantum states</span><span><Sparkles/> AI learning companion</span></div></article>)}
        <div className="future-projects reveal">{futureProjectSlots.map(number => <div className="future-project" key={number}><span className="mono">PROJECT / {number}</span><Plus size={30}/><h3>Room for the next idea.</h3><p>A future build will live here.</p><span className="coming-tag">STILL A BLANK CANVAS</span></div>)}</div>
      </section>

      <section id="play" className="play-section section-shell">
        <div className="section-kicker reveal"><span>03 / THE PLAYGROUND</span><span>YOU’VE EARNED A SIDE QUEST.</span></div>
        <div className="play-layout"><div className="play-copy reveal"><span className="sidequest-icon"><Gamepad2 size={30}/></span><h2>All work?<br/><span className="serif">Not around here.</span></h2><p>Sometimes the best way to solve a problem is to play with it. Here’s a small one just for you.</p><div className="quest-instructions"><span>01 <b>Start the game.</b></span><span>02 <b>Find and catch all 8 bugs.</b></span><span>03 <b>Enjoy a very clean deployment.</b></span></div><span className="handwritten">Your inner debugger has been waiting for this.</span></div><div className="reveal"><Game sound={sound}/></div></div>
      </section>

      <section id="contact" className="contact-section section-shell">
        <div className="section-kicker reveal"><span>04 / THE NEXT CHAPTER</span><span>GOOD THINGS START WITH A HELLO.</span></div>
        <div className="contact-main reveal"><div><span className="contact-pretitle"><span className="status-dot"/> LET’S MAKE SOMETHING THAT MATTERS</span><h2>Got a good<br/><span className="serif">“what if”?</span><span className="contact-asterisk">✳</span></h2><p>A project, an opportunity, or a particularly good idea.<br/>I’d love to hear about it.</p></div><a className="contact-orb" href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`}><ArrowUpRight/><span>LET’S TALK</span></a></div>
        <div className="contact-links reveal"><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}</a><button className="copy-button" onClick={copyEmail} aria-label="Copy email address">{copied ? <Check size={18}/> : <Copy size={18}/>}<span aria-live="polite">{copied ? 'Copied!' : copyFailed ? 'Select email to copy' : 'Copy email'}</span></button><div className="social-links"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={18}/> GitHub <ArrowUpRight size={14}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18}/> LinkedIn <ArrowUpRight size={14}/></a></div></div>
      </section>
    </main>
    <footer className="site-footer section-shell"><a className="footer-brand" href="#home">m.</a><span>© {new Date().getFullYear()} Mohit Srivastava</span><span className="footer-note">Made with intention. And a little play.</span><a className="back-top" href="#home">BACK TO TOP <ArrowRight size={15}/></a></footer>
    <aside className="experience-controls" aria-label="Experience settings"><button onClick={() => { soundRef.current = !soundOn; setSoundOn(!soundOn); if (!soundOn) sound(620) }} aria-label={soundOn ? 'Mute sound' : 'Enable sound'} aria-pressed={soundOn} title={soundOn ? 'Sound on' : 'Sound off'}>{soundOn ? <Volume2 size={16}/> : <VolumeX size={16}/>}<span>SOUND {soundOn ? 'ON' : 'OFF'}</span></button><span className="control-divider"/><button onClick={() => setReduced(!reduced)} aria-pressed={reduced} aria-label={reduced ? 'Enable animations' : 'Reduce motion'} title={reduced ? 'Enable animations' : 'Reduce motion'}>{reduced ? <Play size={15}/> : <Pause size={15}/>}</button></aside>
  </div>
}

