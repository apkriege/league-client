# UI implementation prompt

Implement the requested change using my existing app's design as the source of truth.

1. Inspect the target screen, nearby screens, shared components, and theme before editing. Match the established design; use the player page and Player Intelligence as supporting references when appropriate.
2. Keep the UI compact and proportional to neighboring elements. Avoid oversized panels, headings, drawers, buttons, full-width secondary actions, and unnecessary whitespace.
3. Reuse existing components, typography, colors, borders, radii, and spacing. Do not apply a predefined design guide, generic dashboard template, or invented visual system.
4. Keep the main task visually primary. Integrate onboarding help through short inline hints, compact rows, or expandable details. Remove repeated headings, decorative elements, nested cards, and unnecessary copy.
5. Preserve readable text, visible keyboard focus, accessible labels, usable mobile targets, and existing behavior. Reduce unnecessary spacing and containers before shrinking text.
6. Inspect the rendered result on desktop and mobile alongside the existing UI. Check wrapping, scrolling, long names, loading, empty, and error states. Correct any oversized or inconsistent additions.
7. Add meaningful frontend and backend tests for changed logic and affected interactions. Run relevant checks and report only results actually verified. Keep each improvement in its own commit.

User feedback overrides any previous design guidance. If a change looks too large or inconsistent, correct it before proceeding.
