# Mohit Srivastava — interactive portfolio

A custom React + TypeScript portfolio with a Three.js cartoon portrait based on Mohit’s photo, GSAP scroll reveals, a quantum gate preview, and a playable bug-hunt mini-game.

## Local development

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build:

```sh
npm run build
npm run preview
```

The static production output is `dist/`. It can be deployed to any static host. `.openai/hosting.json` identifies its Sites preview.

## Personalize

- `src/content.ts`: name, contact details, social links, QubitLab description and links, project tags, and future project slots.
- `src/App.tsx`: personal introduction, section content, toolkit, and interactive quantum preview.
- `src/portrait.ts` and `src/Companion.tsx`: Three.js avatar, jointed arms, reading and exploration props, and interactive motion.
- `src/Guide.tsx` and `src/ProjectTour.tsx`: chapter cues, optional browser narration, and the QubitLab walkthrough.
- `src/Game.tsx`: keyboard-accessible bug hunt with timed and untimed play. Best score is stored only on the visitor's device.
- `src/styles.css`: colors, typography, layouts, breakpoints, and motion preferences.

Only QubitLab is featured. Project slots 02 and 03 are deliberately empty. To add a project, add its data in `projects` and adapt its visual in `App.tsx`, then remove the corresponding number from `futureProjectSlots`.

## Experience details

- Mohit’s avatar follows the pointer. Drag to rotate or lift the avatar on desktop, or use the labeled controls.
- Sound is off by default and uses locally synthesized tones only after opt-in.
- The motion control and the operating system's reduced-motion preference disable ambient animation. Robot tricks use a minimal visual response in reduced-motion mode.
- WebGL failure falls back to a still of the modeled avatar.
- Three.js is loaded separately; offscreen rendering is skipped, pixel ratio is capped, and GPU resources are disposed on unmount.
- Quantum gate buttons illustrate H, X, and Z applied independently to the initial state |0⟩. This is an interactive portfolio concept, not an embedded screenshot of QubitLab.
- The mini-game supports mouse, touch, and Tab + Enter. Untimed mode removes the time limit.
- Contact uses the verified profile email via `mailto:` and a copy button. There is no form backend or data collection.
- Fonts are requested from Google Fonts, with local fallbacks. The character and other artwork need no remote image assets.

## Content sources and creative direction

QubitLab's description and technology stack come from its [repository README](https://github.com/Grayking1905/qubit-lab/blob/main/README.md) and package manifest. The live app URL comes from the repository homepage field. Profile name, GitHub account, email, and LinkedIn were verified from the connected GitHub profile/public profile.

The requested references informed the character-led storytelling, playful interaction, and editorial pacing. All layout, copy, character geometry, and visual assets in this implementation are original. No reference-site code or models are included.

No employment history, client names, testimonials, skill ratings, or performance metrics are invented. Revise the personal statement to match your preferred voice before sharing publicly.
