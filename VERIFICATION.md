# Verification — November 14, 2026

- Production TypeScript/Vite build passes. The lazy Three.js chunk is about 508 kB / 130 kB gzip and triggers Vite's size advisory.
- Browser visually checked desktop hero, reading pose, project chapter, full-color wardrobe and mobile hero/playground/contact.
- All 17 gesture controls and Take a nap reached their corresponding rendered pose, verified on the restored portrait via the renderer's completion attribute. Reading and the closed eyes behind the glasses were visually checked. Keyboard input woke the mascot. Reduced-motion mode freezes continuous movement.
- Automatic drowsiness and sleeping were observed. Sleep overrides the gesture, closes the eyes and adds breathing and Z letters. Pointer, keyboard and scroll activity reset the idle timer; a wake reaction blends back into the selected pose.
- H on a fresh zero qubit: 50% zero / 50% one. X: 100% one. Z: 100% zero. Step navigation updates explanatory text and character cue.
- QubitLab story opens as a native modal; Escape closes it. Focus returns to the opener.
- Email copy resolves and shows success. Browser tool clipboard readback uses a separate clipboard and did not confirm contents.
- 390 × 844 mobile viewport: no horizontal overflow. Playground avatar moved to an inline sticky stage after detecting overlap with gesture buttons. Contact avatar reduced after detecting overlap with social links.
- No browser console errors were observed during these checks.
- Optional browser voice toggle is implemented; audible playback and installed voice availability were not independently verified. WebGL creation/context-loss fallback was reviewed in code, not fault-injected.
- No remote service, GitHub profile, or QubitLab source was modified.

## Hand and leg refinement

- Mirrored finger lengths, three-joint finger curls, a separate articulated thumb and a flattened palm replace overlapping finger ovals.
- Wave keeps a stable open hand and uses slower wrist motion; each pose resets every finger and thumb joint.
- Continuous skinned trouser geometry bends across the knee. Tapered calves, shaped shoes and laces replace disconnected leg blocks.
- Production build passed. Wave, dance, reading, magnifier, phone, punch, peekaboo and return-to-wave were exercised in the browser. Ink and color renderings were inspected; no console errors were reported.
