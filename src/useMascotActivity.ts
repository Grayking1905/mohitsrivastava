import { useCallback, useEffect, useRef, useState } from 'react'

export type Activity = 'awake' | 'drowsy' | 'asleep' | 'waking'
export const DROWSY_AFTER_MS = 12_000
export const SLEEP_AFTER_MS = 20_000

export default function useMascotActivity() {
  const [activity,setActivity]=useState<Activity>('awake')
  const phase=useRef<Activity>('awake')
  const lastActivity=useRef(performance.now())
  const wakeTimer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const change=useCallback((next:Activity)=>{phase.current=next;setActivity(next)},[])
  const wake=useCallback(()=>{
    lastActivity.current=performance.now()
    if(phase.current==='awake'||phase.current==='waking')return
    clearTimeout(wakeTimer.current)
    if(phase.current==='drowsy'){change('awake');return}
    change('waking')
    wakeTimer.current=setTimeout(()=>change('awake'),1400)
  },[change])
  const sleepNow=useCallback(()=>{clearTimeout(wakeTimer.current);change('asleep')},[change])
  useEffect(()=>{
    // A single, cheap clock avoids creating timers on every pointer movement.
    const clock=setInterval(()=>{
      if(document.hidden||phase.current==='waking'||phase.current==='asleep')return
      const quiet=performance.now()-lastActivity.current
      if(quiet>=SLEEP_AFTER_MS)change('asleep')
      else if(quiet>=DROWSY_AFTER_MS&&phase.current==='awake')change('drowsy')
    },250)
    const visibility=()=>{if(!document.hidden)wake()}
    window.addEventListener('pointermove',wake,{passive:true})
    window.addEventListener('pointerdown',wake,{passive:true})
    window.addEventListener('keydown',wake)
    window.addEventListener('scroll',wake,{passive:true})
    document.addEventListener('visibilitychange',visibility)
    return()=>{
      clearInterval(clock);clearTimeout(wakeTimer.current)
      window.removeEventListener('pointermove',wake);window.removeEventListener('pointerdown',wake)
      window.removeEventListener('keydown',wake);window.removeEventListener('scroll',wake)
      document.removeEventListener('visibilitychange',visibility)
    }
  },[change,wake])
  return {activity,wake,sleepNow}
}
