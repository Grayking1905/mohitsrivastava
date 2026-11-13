import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowUpRight, ArrowRight, Github, Linkedin, Volume2, VolumeX, Pause, Play, Code2, Sparkles, Terminal, Braces, Layers, Plus, Check, Copy, Menu, X, Atom, Gamepad2 } from 'lucide-react'
import Guide from './Guide'
import type { Cue } from './Guide'
import ProjectTour from './ProjectTour'
import { profile, projects, futureProjectSlots } from './content'
import Game from './Game'

gsap.registerPlugin(ScrollTrigger)
const nav = [{ id: 'about', name: 'About' }, { id: 'work', name: 'QubitLab' }, { id: 'play', name: 'Playground' }]

export default function App() {
  const [soundOn, setSoundOn] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [active, setActive] = useState('home')
  const [menu, setMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [cue, setCue] = useState<Cue | null>(null)
  const soundRef = useRef(false)
  const audio = useRef<AudioContext | null>(null)
  const main = useRef<HTMLDivElement>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
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
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced)
    const context = gsap.context(() => {
      if (reduced) return
      gsap.from('.hero-reveal', { y: 35, opacity: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out', clearProps: 'all' })
      gsap.utils.toArray<HTMLElement>('.reveal').forEach(element => gsap.from(element, { y: 38, opacity: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true }, clearProps: 'all' }))
      gsap.to('.scroll-line', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true } })
    }, main)
    return () => context.revert()
  }, [reduced])
  useEffect(() => {
    const layout = document.querySelector<HTMLElement>('.journey-layout')!
    const hero = document.querySelector<HTMLElement>('#home')!
    const size = new ResizeObserver(() => layout.style.setProperty('--hero-height', hero.offsetHeight + 'px'))
    size.observe(hero)
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id) }) }, { rootMargin: '-20% 0px -55% 0px' })
    document.querySelectorAll('.journey-content > section[id]').forEach(section => observer.observe(section))
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onPreference = (event: MediaQueryListEvent) => setReduced(event.matches)
    preference.addEventListener('change', onPreference)
    return () => { observer.disconnect(); size.disconnect(); preference.removeEventListener('change', onPreference); clearTimeout(copyTimer.current); void audio.current?.close() }
  }, [])
  useEffect(() => {
    if (!menu) return
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false) }
    window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close)
  }, [menu])
  const explain = useCallback((next: Cue) => setCue(next), [])
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyFailed(false); sound(660); clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(false), 2600) }
    catch { setCopyFailed(true) }
  }

  return <div ref={main}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Mohit Srivastava, home"><span className="brand-mark">m<span>.</span></span><span>MOHIT<br/><b>SRIVASTAVA</b></span></a>
      <nav className={menu ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">{nav.map(item => <a key={item.id} href={`#${item.id}`} onClick={() => setMenu(false)} aria-current={active === item.id ? 'location' : undefined}>{item.name}</a>)}</nav>
      <a className="contact-nav" href="#contact">Let’s talk <ArrowUpRight size={17}/></a>
      <button className="menu-toggle icon-button" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu}>{menu ? <X/> : <Menu/>}</button>
      <div className="scroll-line"/>
    </header>
    <main id="main" className="journey-layout">
      <div className="journey-content">
      <section className="hero section-shell" id="home">
        <div className="hero-copy">
          <div className="eyebrow hero-reveal">SOFTWARE ENGINEER</div>
          <h1 className="hero-reveal">I’m Mohit.<br/>I build things<br/><em>you can play with.</em></h1>
          <p className="hero-description hero-reveal">I turn complex ideas into software you can explore. Start with QubitLab, or take the tour with my 3D guide.</p>
          <div className="hero-buttons hero-reveal">
            <a className="button primary" href="#work">Explore QubitLab <ArrowUpRight size={18}/></a>
            <a className="text-link" href="#about">Take the tour <ArrowDown size={17}/></a>
          </div>
        </div>
      </section>

      <section id="about" className="about-section section-shell">
        <div className="section-kicker reveal">ABOUT ME</div>
        <div className="about-grid">
          <div className="about-heading reveal"><h2>Engineer by craft.<br/><span className="serif">Explorer at heart.</span></h2></div>
          <div className="about-copy reveal"><p className="large-copy">I like making complicated things<br className="desktop-break"/> feel <span>surprisingly simple.</span></p><p>For me, engineering is equal parts logic and imagination. It’s connecting the dots between a tricky problem, a thoughtful interface, and the code that brings it all together.</p><p>QubitLab is one expression of that curiosity: turning abstract quantum concepts into something you can see, touch, and experiment with.</p><div className="about-note"><Sparkles size={20}/><span>Good software works.<br/><b>Great software makes you want to explore.</b></span></div><a className="text-link" href={profile.github} target="_blank" rel="noreferrer">Find me where the code lives <Github size={18}/></a></div>
        </div>
        <div className="toolkit reveal"><div className="toolkit-title"><span className="mono">MY TOOLKIT</span><span>Different tools.<br/>Same builder’s mindset.</span></div><div className="toolkit-items">{[{ icon: Braces, name: 'TypeScript', label: 'THE LANGUAGE' }, { icon: Code2, name: 'React / Next.js', label: 'THE INTERFACE' }, { icon: Atom, name: 'Three.js', label: 'THE DIMENSION' }, { icon: Terminal, name: 'Python / FastAPI', label: 'THE ENGINE' }, { icon: Layers, name: 'PostgreSQL', label: 'THE MEMORY' }].map(({ icon: Icon, name, label }) => <div className="tool-item" key={name}><Icon size={24}/><span>{name}</span><small>{label}</small></div>)}</div></div>
      </section>

      <section id="work" className="work-section section-shell">
        <div className="section-kicker reveal">FEATURED PROJECT</div>
        <div className="section-heading reveal"><h2>QubitLab</h2></div>
        {projects.map(project => <article className="project reveal" key={project.id}><ProjectTour onCue={explain}/><div className="project-detail"><div><span className="project-kind mono">INTERACTIVE LEARNING · FULL STACK</span><p>{project.description}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><div className="project-actions"><a href={project.live} target="_blank" rel="noreferrer" className="button primary">Explore QubitLab <ArrowUpRight size={18}/></a><a href={project.repository} target="_blank" rel="noreferrer" className="text-link"><Github size={17}/> View source code</a></div></div><div className="project-features"><span><Braces/> Visual circuit builder</span><span><Atom/> 3D quantum states</span><span><Sparkles/> AI learning companion</span></div></article>)}
        <div className="future-projects reveal">{futureProjectSlots.map(number => <div className="future-project" key={number}><span className="mono">PROJECT / {number}</span><Plus size={30}/><h3>Room for the next idea.</h3><p>A future build will live here.</p><span className="coming-tag">STILL A BLANK CANVAS</span></div>)}</div>
      </section>

      <section id="play" className="play-section section-shell">
        <div className="section-kicker reveal">PLAYGROUND</div>
        <div className="play-layout"><div className="play-copy reveal"><span className="sidequest-icon"><Gamepad2 size={30}/></span><h2>All work?<br/><span className="serif">Not around here.</span></h2><p>Sometimes the best way to solve a problem is to play with it. Here’s a small one just for you.</p><div className="quest-instructions"><span>01 <b>Start the game.</b></span><span>02 <b>Find and catch all 8 bugs.</b></span><span>03 <b>Enjoy a very clean deployment.</b></span></div><span className="handwritten">Your inner debugger has been waiting for this.</span></div><div className="reveal"><Game sound={sound}/></div></div>
      </section>

      <section id="contact" className="contact-section section-shell">
        <div className="section-kicker reveal">CONTACT</div>
        <div className="contact-main reveal"><div><span className="contact-pretitle"><span className="status-dot"/> LET’S MAKE SOMETHING THAT MATTERS</span><h2>Got a good<br/><span className="serif">“what if”?</span><span className="contact-asterisk">✳</span></h2><p>A project, an opportunity, or a particularly good idea.<br/>I’d love to hear about it.</p></div><a className="contact-orb" href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`}><ArrowUpRight/><span>LET’S TALK</span></a></div>
        <div className="contact-links reveal"><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}</a><button className="copy-button" onClick={copyEmail} aria-label="Copy email address">{copied ? <Check size={18}/> : <Copy size={18}/>}<span aria-live="polite">{copied ? 'Copied!' : copyFailed ? 'Select email to copy' : 'Copy email'}</span></button><div className="social-links"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={18}/> GitHub <ArrowUpRight size={14}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18}/> LinkedIn <ArrowUpRight size={14}/></a></div></div>
      </section>
      </div>
      <Guide chapter={active} cue={active === "work" ? cue : null} reduced={reduced}/>
    </main>
    <footer className="site-footer section-shell"><a className="footer-brand" href="#home">m.</a><span>© {new Date().getFullYear()} Mohit Srivastava</span><span className="footer-note">Made with intention. And a little play.</span><a className="back-top" href="#home">BACK TO TOP <ArrowRight size={15}/></a></footer>
    <aside className="experience-controls" aria-label="Experience settings"><button onClick={() => { soundRef.current = !soundOn; setSoundOn(!soundOn); if (!soundOn) sound(620) }} aria-label={soundOn ? 'Mute sound' : 'Enable sound'} aria-pressed={soundOn} title={soundOn ? 'Sound on' : 'Sound off'}>{soundOn ? <Volume2 size={16}/> : <VolumeX size={16}/>}<span>SOUND {soundOn ? 'ON' : 'OFF'}</span></button><span className="control-divider"/><button onClick={() => setReduced(!reduced)} aria-pressed={reduced} aria-label={reduced ? 'Enable animations' : 'Reduce motion'} title={reduced ? 'Enable animations' : 'Reduce motion'}>{reduced ? <Play size={15}/> : <Pause size={15}/>}</button></aside>
  </div>
}
