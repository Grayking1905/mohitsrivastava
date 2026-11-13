import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowDown, BookOpen, ChevronDown, Hand, MessageSquare, RotateCw, ScanSearch, Sparkles, Volume2, VolumeX } from 'lucide-react'
import type { Gesture, Pose } from './Companion'

const Companion = lazy(() => import('./Companion'))
export type Cue = { pose: Pose; line: string }
export const chapterCues: Record<string, Cue> = {
  home: { pose: 'wave', line: 'Hey, I’m Mohit. Scroll down and I’ll show you around.' },
  about: { pose: 'read', line: 'Here’s a little about how I learn, build, and get unstuck.' },
  work: { pose: 'explore', line: 'Come take a closer look at QubitLab. Pick a step or try a quantum gate.' },
  play: { pose: 'think', line: 'Fancy a side quest? See if you can catch all eight bugs.' },
  contact: { pose: 'wave', line: 'Thanks for coming along. If you’d like to work together, say hello!' },
}
const actions = [
  { pose: 'wave', name: 'Wave', icon: Hand, line: 'Hey there! Good to meet you.' },
  { pose: 'read', name: 'Read', icon: BookOpen, line: 'One more page. I’m getting to the good part.' },
  { pose: 'explore', name: 'Inspect', icon: ScanSearch, line: 'Let’s take a closer look. There’s always more to discover.' },
  { pose: 'explain', name: 'Explain', icon: MessageSquare, line: 'QubitLab turns quantum ideas into experiments. Build a circuit, then watch what it does to a qubit.' },
  { pose: 'celebrate', name: 'Celebrate', icon: Sparkles, line: 'Small wins are worth celebrating.' },
  { pose: 'spin', name: 'Spin', icon: RotateCw, line: 'A little change of perspective!' },
] as const
const nextChapter: Record<string, string> = { home: 'about', about: 'work', work: 'play', play: 'contact', contact: 'home' }

export default function Guide({ chapter, cue, reduced }: { chapter: string; cue: Cue | null; reduced: boolean }) {
  const [override, setOverride] = useState<Cue | null>(null)
  const [gesture, setGesture] = useState<Gesture>({ pose: 'idle', sequence: 0 })
  const [talking, setTalking] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const reopen = useRef<HTMLButtonElement>(null)
  const speechTimer = useRef<number | undefined>(undefined)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const line = override ?? cue ?? chapterCues[chapter] ?? chapterCues.home

  useEffect(() => {
    setOverride(null)
    setExpanded(false)
    if (cue) setMinimized(false)
  }, [chapter, cue])

  useEffect(() => {
    window.clearTimeout(speechTimer.current)
    setGesture(previous => ({ pose: line.pose, sequence: previous.sequence + 1 }))
    setTalking(line.pose === 'explain')
    if (line.pose === 'explain') speechTimer.current = window.setTimeout(() => setTalking(false), Math.min(5500, 90 * line.line.length))
    if (utterance.current) {
      utterance.current = null
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
    return () => window.clearTimeout(speechTimer.current)
  }, [line, reduced])

  useEffect(() => () => {
    if (utterance.current) {
      utterance.current = null
      window.speechSynthesis.cancel()
    }
  }, [])

  function readAloud() {
    if (speaking) {
      utterance.current = null
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const speech = new SpeechSynthesisUtterance(line.line)
    utterance.current = speech
    speech.lang = 'en-IN'
    speech.rate = .94
    const finish = () => {
      if (utterance.current !== speech) return
      utterance.current = null
      setSpeaking(false)
    }
    speech.onend = finish
    speech.onerror = finish
    setSpeaking(true)
    window.speechSynthesis.speak(speech)
  }

  return (
    <aside className={`guide-shell ${chapter !== 'home' ? 'guide-docked' : ''}`} aria-label="Mohit, your portfolio guide" data-minimized={minimized}>
      <button ref={reopen} className="guide-reopen" aria-expanded={!minimized} aria-controls="guide-panel" onClick={() => setMinimized(false)}><MessageSquare size={16}/> Show tour guide</button>
      <div id="guide-panel" className={`guide-panel ${expanded ? 'guide-expanded' : ''}`} data-pose={gesture.pose}>
        <div className="guide-header">
          <span><i /> TOUR GUIDE</span>
          <a href={`#${nextChapter[chapter] ?? 'about'}`} aria-label={chapter === 'contact' ? 'Back to the start' : 'Go to the next chapter'}><ArrowDown size={17}/></a>
        </div>
        <div className="guide-speech">
          <p>{line.line}</p>
          {'speechSynthesis' in window && <button onClick={readAloud} aria-label={speaking ? 'Stop reading aloud' : 'Read guide aloud'} aria-pressed={speaking}>{speaking ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button>}
        </div>
        <div className="guide-stage">
          <span className="stage-orbit" aria-hidden="true"/>
          <span className="stage-glow" aria-hidden="true"/>
          <Suspense fallback={<div className="avatar-fallback"><img src="/avatar-poster.jpg" alt="" /></div>}>
            <Companion gesture={gesture} talking={talking || speaking} reduced={reduced} onTap={() => setOverride({ ...actions[0] })}/>
          </Suspense>
        </div>
        <div className="guide-actions">
          <button className="guide-minimize" onClick={() => { setMinimized(true); setExpanded(false); requestAnimationFrame(() => reopen.current?.focus()) }}>Hide guide</button>
          <span className="drag-hint">Drag to turn or lift me</span>
          <button className="guide-expand" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="avatar-actions">Gestures <ChevronDown size={15}/></button>
          <div id="avatar-actions" className="guide-gestures" aria-label="Avatar gestures">
            {actions.map(({ pose, name, icon: Icon, line }) => <button key={pose} type="button" aria-pressed={gesture.pose === pose} onClick={() => setOverride({ pose, line })}><Icon size={15}/>{name}</button>)}
          </div>
        </div>
      </div>
    </aside>
  )
}

