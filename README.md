# Mohit — an explorable portfolio

An eight-chapter software engineering portfolio built with React, TypeScript, Three.js, GSAP and Vite. QubitLab is the featured project, with two slots reserved for future work.

## Develop

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Run the motion regression tests with `node --experimental-strip-types --test tests/motion.test.mjs`.

## Project layout

- `src/App.tsx` and `src/experience.css`: chapters, responsive layout, navigation and interaction controls.
- `src/content.ts`: profile, project and contact links.
- `src/ProjectTour.tsx`: interactive QubitLab walkthrough.
- `src/Companion.tsx`, `src/mascotRig.ts` and `src/naturalMotion.ts`: avatar rendering, model and motion.
- `src/useMascotActivity.ts`: sleep and wake behavior.
- `src/useNarration.ts` and `src/narration-clips.json`: playback and the caption-to-clip index. The files in `public/narration/` are rendered with ElevenLabs' Vikram voice; visitors can enable them without an API key or account. When changing a spoken line, update its caption and clip together.
- `public/`: favicon and static avatar fallback.
- `.openai/hosting.json`: Sites deployment configuration. Vite builds the site to `dist/`.
