# Instructions for AI Coding Agents — VERA CLOTHING

## Before making changes

- Read PRD.md, ARCHITECTURE.md, and STYLE.md before making significant changes.
- Follow the documented architecture and distinguish first-stage frontend scope from future integrations.
- Explain important architectural changes before making them.
- Do not implement future features unless requested. In particular, do not add Mailgun, Google authentication, payment processing, or additional privileged admin integrations unless explicitly asked. The approved public catalogue and customer email/password Auth must not be expanded to privileged data operations without a separate request.

## Implementation standards

- Use reusable React components and keep components modular, focused, and maintainable.
- Keep the wishlist functionality separate and reusable so its local implementation can later be connected to Supabase without rewriting the UI.
- Make the VERA CLOTHING brand name, logo, colors, and other branding easy to change from centralized configuration/assets.
- Keep code understandable, typed where the project uses types, and consistent with existing conventions.
- Do not unnecessarily rewrite working code or introduce unnecessary dependencies.
- Keep customer information secure. Never hard-code secrets; use environment variables for API keys and secrets, and never expose private API keys in frontend code.
- Frontend Supabase configuration may use only the project URL and publishable/anon key. Never expose service-role or secret keys through `VITE_*` variables, browser code, or committed environment files.
- Treat browser-provided prices, totals, inventory, and order status as untrusted when future backend integrations are added.
- Do not store payment credentials or sensitive customer information in browser persistence.

## Verification

- Test the application after significant changes using the project’s existing scripts and conventions.
- Fix errors before moving to the next feature; do not conceal failing checks or claim unrun checks passed.
- For UI work, consider responsive behavior, keyboard access, accessible labels/focus, loading/empty/error states, and the design system in STYLE.md.
- Summarize meaningful changes and report tests/checks performed, including any known limitations.
