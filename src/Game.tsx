import { useEffect, useRef, useState } from 'react'
import { Bug, Play, RotateCcw, Trophy, ArrowUpRight } from 'lucide-react'

const locations = [{ x: 12, y: 19 }, { x: 42, y: 9 }, { x: 76, y: 20 }, { x: 27, y: 42 }, { x: 64, y: 48 }, { x: 10, y: 72 }, { x: 45, y: 75 }, { x: 82, y: 72 }]
export default function Game({ sound }: { sound: (pitch?: number) => void }) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [caught, setCaught] = useState<number[]>([])
  const [seconds, setSeconds] = useState(20)
  const [timed, setTimed] = useState(true)
  const deadline = useRef(0)
  const machine = useRef<HTMLDivElement>(null)
  const [best, setBest] = useState(() => { try { return Math.min(8, Math.max(0, Number(localStorage.getItem('mohit-bug-best')) || 0)) } catch { return 0 } })
  useEffect(() => {
    if (status !== 'playing' || !timed) return
    const timer = window.setInterval(() => { const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setSeconds(remaining); if (!remaining) setStatus('lost') }, 200)
    return () => clearInterval(timer)
  }, [status, timed])
  useEffect(() => {
    if (status === 'idle') return
    // Keep keyboard players inside the game as caught buttons disappear.
    const next = machine.current?.querySelector<HTMLButtonElement>(status === 'playing' ? '.game-bug' : '.game-message button')
    next?.focus({ preventScroll: true })
  }, [status, caught])
  const start = () => { setCaught([]); setSeconds(20); deadline.current = Date.now() + 20000; setStatus('playing'); sound(330) }
  const catchBug = (id: number) => {
    if (status !== 'playing' || caught.includes(id) || (timed && Date.now() >= deadline.current)) return
    const next = [...caught, id]; setCaught(next); sound(400 + next.length * 70)
    if (next.length > best) { setBest(next.length); try { localStorage.setItem('mohit-bug-best', String(next.length)) } catch { /* Storage is optional. */ } }
    if (next.length === 8) setStatus('won')
  }
  return <div className="game-machine" ref={machine}>
    <div className="game-topline"><span><i className="status-dot"/> BUG HUNT.exe</span><span>BEST {String(best).padStart(2, '0')}/08</span></div>
    <div className="game-board">
      {status === 'playing' ? <>
        <div className="game-hud"><span>BUGS FIXED <b>{caught.length}/8</b></span><span aria-live="off">{timed ? `${seconds}s remaining` : 'Take your time'}</span></div>
        {locations.map((position, i) => !caught.includes(i) && <button key={i} className={`game-bug bug-${i}`} style={{ left: `${position.x}%`, top: `${position.y + 12}%` }} onClick={() => catchBug(i)} aria-label={`Catch bug ${i + 1}`}><Bug size={25}/></button>)}
        <span className="sr-only" role="status">{caught.length} of 8 bugs caught.</span>
      </> : <div className="game-message" aria-live="polite">
        {status === 'won' ? <Trophy size={43}/> : <Bug size={43}/>}
        <h3>{status === 'won' ? 'Zero bugs. Big energy.' : status === 'lost' ? 'A few bugs got away.' : 'A tiny debugging break.'}</h3>
        <p>{status === 'won' ? 'All 8 caught. You’ve earned your rubber duck.' : status === 'lost' ? `${caught.length} of 8 fixed. Even great engineers need another run.` : '8 sneaky bugs. 20 seconds. You know what to do.'}</p>
        <button className="button light" onClick={start}>{status === 'idle' ? <Play size={16}/> : <RotateCcw size={16}/>} {status === 'idle' ? 'Let’s play' : 'Play again'}<ArrowUpRight size={17}/></button>
        <label className="zen-option"><input type="checkbox" checked={!timed} onChange={e => setTimed(!e.target.checked)}/> No timer. Just good vibes.</label>
      </div>}
    </div>
    <div className="game-bottomline"><span>CLICK · TAP · OR TAB + ENTER</span>{status === 'playing' ? <button onClick={() => setStatus('idle')}>Exit game ↗</button> : <span>NO ACTUAL CODE WAS HARMED</span>}</div>
  </div>
}
