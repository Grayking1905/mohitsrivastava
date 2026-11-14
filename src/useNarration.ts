/// <reference types="vite/client" />
import { useCallback, useEffect, useRef } from 'react'
import clips from './narration-clips.json'

const tracks: Record<string, string> = clips

export default function useNarration(onSpeaking: (speaking: boolean) => void) {
  const active = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    const audio = active.current
    active.current = null
    if (!audio) return
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }, [])

  const play = useCallback((line: string) => {
    stop()
    onSpeaking(false)
    if (!Object.hasOwn(tracks, line)) return
    const audio = new Audio(`${import.meta.env.BASE_URL}narration/${tracks[line]}`)
    active.current = audio
    const update = (speaking: boolean) => {
      if (active.current === audio) onSpeaking(speaking)
    }
    audio.onplaying = () => update(true)
    audio.onwaiting = () => update(false)
    audio.onended = audio.onerror = () => update(false)
    void audio.play().catch(() => update(false))
  }, [onSpeaking, stop])

  useEffect(() => {
    const pauseOnHide = () => {
      if (document.hidden) { stop(); onSpeaking(false) }
    }
    document.addEventListener('visibilitychange', pauseOnHide)
    return () => {
      document.removeEventListener('visibilitychange', pauseOnHide)
      stop()
    }
  }, [onSpeaking, stop])

  return { play, stop }
}
