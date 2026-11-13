# Verification

Checked on November 12, 2026.

- TypeScript strict compilation and Vite production build passed.
- npm installation audit reported 0 vulnerabilities.
- Browser console showed no errors or warnings during the tested flows.
- Avatar update: desktop 3D portrait, scroll-triggered reading and inspection poses, QubitLab explanations, and the collapsible mobile guide verified.
- H/X/Z preview updates checked against the expected single-gate results for |0⟩.
- QubitLab repository points to the exact repository supplied by the owner; its live destination opened successfully with the title “QubitLab — Make quantum click.”
- Untimed bug hunt completed with mouse and keyboard controls.
- Timed mode reached its timeout state; retry worked.
- All eight bugs caught using only Enter with automatic focus progression. Completion focuses Play again.
- Email copy produced its success state; email and social destinations were inspected.
- Reduced-motion control changed its state and disabled ambient animation.
- Mobile menu opens, navigates, and closes; the desktop navigation remains visible at wider widths.
- Responsive layouts inspected at mobile and desktop widths, including a 320-pixel stress check. A contact decoration that caused horizontal overflow was corrected; the 390-pixel check reported matching content and viewport widths.

Remaining limits: no physical-device performance profiling, no screen-reader session, and no cross-browser test matrix. WebGL fallback is implemented but was not forced during browser testing. The contact link intentionally opens the visitor’s email client; it does not send mail itself.
