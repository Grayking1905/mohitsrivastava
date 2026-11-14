import { useState } from 'react'
import { ArrowLeft, ArrowRight, Atom, BookOpen, Braces, Sparkles } from 'lucide-react'
import type { Cue } from './characterTypes'

const gates = {
  H: { label: 'Hadamard', caption: 'Superposition', measurement: '50% |0⟩ · 50% |1⟩', explanation: 'The Hadamard gate gives a qubit starting at zero an equal chance of being measured as zero or one.' },
  X: { label: 'Pauli X', caption: 'Bit flip', measurement: '100% |1⟩', explanation: 'The X gate flips zero to one. The arrow moves from the north pole of the sphere to the south pole.' },
  Z: { label: 'Pauli Z', caption: 'Phase flip', measurement: '100% |0⟩', explanation: 'The Z gate changes the phase of the one component. This qubit starts at zero, so its state stays the same.' },
}
const steps = [
  { name: 'Build a circuit', icon: Braces, text: 'Choose H, X, or Z to apply a gate to a qubit that starts in |0⟩. Each choice starts a fresh circuit.', voice: 'Here’s the circuit builder. Pick a gate to apply it to a qubit that starts at zero.' },
  { name: 'See the state', icon: Atom, text: 'The arrow on the Bloch sphere shows the state after the gate. The readout gives the probability of measuring zero or one.', voice: 'The arrow on the Bloch sphere shows the state after the gate. The numbers below tell you how likely zero and one are.' },
  { name: 'Learn by asking', icon: Sparkles, text: 'In the full app, an AI tutor helps you reason through circuits and quantum concepts while you experiment.', voice: 'If the math gets tricky, QubitLab’s tutor can help you work through the circuit. You can try it in the full app.' },
]
export default function ProjectTour({ onCue }: { onCue: (cue: Cue) => void }) {
  const [step, setStep] = useState(0)
  const [gate, setGate] = useState<keyof typeof gates>('H')
  const current = gates[gate]
  const selected = steps[step]
  function chooseStep(index: number) {
    setStep(index)
    onCue({ pose: index === 1 ? 'explore' : 'explain', line: steps[index].voice })
  }
  return (
    <div className="project-tour">
      <div className="tour-tabs" aria-label="QubitLab walkthrough">
        {steps.map(({ icon: Icon, name }, index) => <button key={name} aria-pressed={index === step} onClick={() => chooseStep(index)}><Icon size={17}/><span>{name}</span></button>)}
      </div>
      <div className="tour-step">
        <div><h3>{selected.name}</h3><p>{selected.text}</p></div>
        <button aria-label="Have Mohit explain this step" onClick={() => onCue({ pose: 'explain', line: selected.voice })}><BookOpen size={18}/></button>
      </div>
      <div className="quantum-preview">
        <div className="preview-toolbar"><span><Atom size={18}/> QubitLab</span><span className="preview-tag">INTERACTIVE DEMO</span></div>
        <div className="preview-content">
          <div className="preview-side">
            <span className="mono">ONE QUBIT CIRCUIT</span><h3>Try a gate</h3>
            <div className="gate-selector" aria-label="Choose a quantum gate">
              {(Object.keys(gates) as (keyof typeof gates)[]).map(key => <button key={key} className={key === gate ? 'selected' : ''} title={gates[key].label} aria-pressed={key === gate} onClick={() => { setGate(key); onCue({ pose: 'explain', line: gates[key].explanation }) }}>{key}</button>)}
            </div>
            <span className="gate-hint">{current.label} · {current.caption}</span>
          </div>
          <div className={`bloch-system gate-${gate}`} aria-label={current.measurement}>
            <span className="ket top">|0⟩</span>
            <div className="bloch-sphere"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="orbit orbit-c"/><div className="sphere-axis"/><div className="state-vector"><i/></div><span className="sphere-center"/></div>
            <span className="ket bottom">|1⟩</span>
          </div>
        </div>
        <div className="circuit-line"><span>|0⟩</span><i/><b>{gate}</b><i/><span className="measurement" aria-live="polite">{current.measurement}</span></div>
      </div>
      <div className="tour-pagination">
        <button onClick={() => chooseStep(step - 1)} disabled={step === 0}><ArrowLeft size={16}/> Previous</button>
        <span>Step {step + 1} of {steps.length}</span>
        <button onClick={() => chooseStep(step + 1)} disabled={step === steps.length - 1}>Next <ArrowRight size={16}/></button>
      </div>
    </div>
  )
}
