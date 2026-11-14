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
- `public/`: favicon and static avatar fallback.
- `.openai/hosting.json`: Sites deployment configuration. Vite builds the site to `dist/`.
