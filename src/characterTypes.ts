export type Pose = 'idle' | 'wave' | 'read' | 'explore' | 'explain' | 'think' | 'celebrate' | 'spin' | 'dance' | 'panic' | 'fly' | 'vanish' | 'sneeze' | 'selfie' | 'hiccup' | 'peekaboo' | 'sulk' | 'punch' | 'dizzy'
export type Gesture = { pose: Pose; sequence: number }
export type Cue = { pose: Pose; line: string }
