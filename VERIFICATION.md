# Verification — November 13, 2026

- Production TypeScript/Vite build passes. The lazy Three.js chunk reports the standard >500 kB warning; gzip is about 129 kB.
- Browser visually checked desktop hero, reading pose, project chapter, full-color wardrobe and mobile hero/playground/contact.
- All twelve gesture controls update the corresponding pose and pressed state. Rendered reading, explanation and selfie/wink states were observed. Reduced-motion mode freezes continuous movement.
- H on a fresh zero qubit: 50% zero / 50% one. X: 100% one. Z: 100% zero. Step navigation updates explanatory text and character cue.
- QubitLab story opens as a native modal; Escape closes it. Focus returns to the opener.
- Email copy resolves and shows success. Browser tool clipboard readback uses a separate clipboard and did not confirm contents.
- 390 × 844 mobile viewport: no horizontal overflow. Playground avatar moved to an inline sticky stage after detecting overlap with gesture buttons. Contact avatar reduced after detecting overlap with social links.
- No browser console errors were observed during these checks.
- Optional browser voice toggle is implemented; audible playback and installed voice availability were not independently verified. WebGL creation/context-loss fallback was reviewed in code, not fault-injected.
- No remote service, GitHub profile, or QubitLab source was modified.
