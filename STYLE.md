# Visual Design System — VERA CLOTHING

**Design intent:** Modern, elegant, clean, premium, minimal, fashion-focused, and responsive. This is a practical starting system, not a rigid theme; keep all brand-specific values centralized so VERA CLOTHING can be renamed or rebranded without changing feature structure.

## 1. Brand expression

VERA CLOTHING should feel editorial and confident rather than ornate. Use generous whitespace, restrained color, considered typography, strong product photography, and concise copy. Product imagery is the visual focus. Avoid excessive borders, gradients, badges, animation, and decorative effects.

## 2. Color tokens

Use semantic token names in CSS/Tailwind configuration instead of scattering raw values through components. Suggested initial palette:

| Token | Suggested value | Use |
|---|---|---|
| `brand-ink` | `#22211F` | Primary text, dark buttons, wordmark |
| `brand-paper` | `#FAF9F6` | Main warm background |
| `surface` | `#FFFFFF` | Cards, forms, panels |
| `muted` | `#77736D` | Secondary text and metadata |
| `line` | `#E8E5DF` | Subtle dividers and borders |
| `brand-accent` | `#8B6F58` | Restrained accent, selected details |
| `success` | `#356A4A` | Successful actions |
| `danger` | `#A43D35` | Errors, removal/destructive feedback |

Check text/background contrast for accessibility. Use the accent sparingly; do not rely on color alone to convey selection or status. These values can be adjusted as the brand is refined.

## 3. Typography

- Use an elegant editorial serif for large campaign/headline moments and a highly legible sans-serif for navigation, product data, forms, and body copy.
- Define font families centrally; prefer well-supported system fallbacks and load external font assets only when licensed and configured appropriately.
- Keep product names and prices easy to scan. Use restrained letter spacing for uppercase labels; avoid uppercase body paragraphs.
- Establish a responsive type scale: small utility/meta, readable body, clear section heading, and large editorial display. Use fluid sizing only where it improves behavior across viewport widths.

## 4. Layout and spacing

- Use a consistent 4px-based spacing scale (4, 8, 12, 16, 24, 32, 48, 64px) and a centered content container with comfortable side gutters.
- Preserve generous vertical rhythm around headings and product photography; align grids, text, and controls consistently.
- Product grids should use even gaps and stable image ratios. Avoid fixed widths that cause overflow on small screens.
- Use subtle corner radii consistently; the visual language should remain clean, not overly rounded.

## 5. Components and interaction

### Navigation

- Show the VERA CLOTHING wordmark clearly and keep primary shop/category links easy to scan.
- Provide cart and wishlist controls with visible counts; on compact screens use a clear menu trigger and accessible expanded/collapsed state.
- Keep the header calm and persistent only if it does not reduce the usable product viewport.

### Buttons and links

- Primary action: high-contrast filled `brand-ink` with light text; use for add-to-cart and checkout progression.
- Secondary action: quiet outline or text button for less prominent actions.
- Destructive actions use danger styling and clear wording; do not style ordinary wishlist removal as a dramatic error.
- Define hover, focus-visible, active, disabled, and pending states. Ensure adequate touch targets (about 44px minimum where practical).

### Product cards

- Use an image-led card with a consistent crop, concise product name, clear price, and optional minimal category/availability information.
- Make the product navigation target obvious; wishlist control must be independently operable and must not accidentally trigger card navigation.
- Use a clear focus treatment and image alt text. Provide subtle image hover treatment only when it adds useful feedback and respects reduced-motion preferences.

### Wishlist / heart control

- Place a compact heart button on product cards and product details.
- Clearly distinguish saved/unsaved states using both icon treatment and accessible label/state (for example, “Add to wishlist” / “Remove from wishlist”); do not rely on color alone.
- Use a visible focus ring and a generous clickable area. Announce successful changes where appropriate without intrusive motion.

### Product detail page

- Use a responsive image gallery and a clearly ordered information column: product name, price, description, variant choices, availability, add-to-cart, wishlist.
- Size and color selectors must expose labels, selected state, unavailable choices, and keyboard operation. Do not permit an invalid required selection.
- Keep the primary action visually prominent; provide meaningful success/error feedback near the action.

### Forms

- Use persistent visible labels, helpful hints, inline validation, and clear error text associated with each control.
- Show focus, disabled, invalid, and submitting states; avoid placeholder-only labels.
- Group related checkout fields and preserve entered non-sensitive values when correcting validation errors.

### Cart

- Display each item, image, selected size/color, unit price, quantity control, and line total with a clear hierarchy.
- Make quantity updates and remove actions understandable and keyboard accessible. Keep subtotal distinct from future taxes/shipping and explain any estimates.
- Provide a calm empty-cart state with a direct return-to-shop action.

### Checkout

- Use a focused, low-distraction two-column layout on wider screens: details/form on one side, order summary on the other; stack naturally on small screens.
- Keep the order summary readable and total prominent. Communicate that first-stage checkout is a frontend prototype and is not processing payment or placing a production order.

### Wishlist page

- Use the shared product-card language and show saved-item count/context.
- Offer remove and add-to-cart actions without crowding the card. Require size/color selection where needed before adding.
- Empty state should be warm, concise, and include a prominent route back to the shop.

## 6. Responsive behavior

- Design mobile-first. At small widths, simplify navigation, stack product details and checkout content, and retain comfortable controls and readable text.
- Increase product-grid columns progressively as space allows; never force a minimum width that causes horizontal scrolling.
- On narrow screens, keep variant controls and primary actions reachable; allow image galleries and long product titles to adapt without clipping.
- Validate at narrow mobile, tablet, and wide desktop sizes. Respect reduced-motion settings and support keyboard-only interaction at every viewport.

## 7. Accessibility and content

- Use semantic headings, landmarks, buttons, links, form labels, and descriptive image alt text.
- Maintain visible keyboard focus, meaningful accessible names, adequate contrast, and status announcements for dynamic cart/wishlist updates.
- Use concise, helpful product copy. Do not fabricate material, fit, care, stock, or delivery claims when data is unavailable.

## 8. Brand changeability

Store VERA CLOTHING name, logo, color tokens, font choices, and configurable links in a centralized theme/brand configuration. UI components should consume semantic tokens and brand data; do not embed brand strings into domain logic or use brand color literals throughout feature components. Changing the working brand should primarily require updating configuration, assets, and approved content.
