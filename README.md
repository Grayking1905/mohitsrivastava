# Mohit — an explorable portfolio

React 19 + TypeScript + Three.js + GSAP, built with Vite. Original identity, copy, procedural cartoon portrait and interactions. QubitLab is the only featured project; two future slots remain intentionally empty.

## Run

```sh
npm install
npm run dev
npm run build
```

## Edit

- `src/content.ts`: profile, email, social links and project destinations.
- `src/App.tsx`: six chapters, narration, character actions, wardrobe, project dialog and contact actions.
- `src/Companion.tsx`: WebGL lifecycle, full-scene ordered print pass, gaze, elastic drag/lift, blended reactions and render-clock-driven GSAP timelines.
- `src/mascotRig.ts`: the original photo-inspired portrait with swept hair, aviator frames, collared shirt and tie, rebuilt on an expressive rig. Includes closed eyelids, a deformable mouth, articulated fingers and a book with a turning page.
- `src/useMascotActivity.ts`: drowsy after 12 seconds, asleep after 20 seconds, pointer/keyboard/scroll wake and a brief waking reaction.
- `src/ProjectTour.tsx`: interactive single-qubit H/X/Z walkthrough. It is a deliberately limited illustrative demo; the full app is linked.
- `src/experience.css`: full-screen scenes, scroll composition, responsive mobile character stage and reduced motion.
- `public/avatar-poster.svg`: original static fallback when WebGL is unavailable; no user photograph is published.

Desktop: the character moves from the right of the hero to the left of the story, then returns for contact. Mobile: the playground has its own sticky character stage, leaving gesture buttons unobstructed. Optional narration uses the browser's installed voices and is off by default. Motion follows the system preference and can be changed in experience settings.

The playground offers 17 gestures plus Take a nap. Reading, investigating and thinking persist until another action or inactivity. Other reactions return to the chapter's pose. Interrupted spins and disappearances ease back into the new pose. Touch users can scroll over the character or hold briefly to drag it.

The Sites identity and existing owner-only audience are preserved in `.openai/hosting.json`. Publication uses the Sites source workflow.

## Reference investigation

Rea 6.9.0 was installed as requested and used to inspect three public shipped scripts from sebg.ch. The investigation established procedural geometry, a print-like shader, hierarchical animation, scroll staging and interaction patterns. This is an original reconstruction of those ideas, not a copy of the site's source, assets, biography or projects. Static analysis was partial and does not establish complete feature parity. See `REFERENCE-NOTES.md` for the bounded evidence.
