# Product Requirements Document — VERA CLOTHING

**Status:** Planning / frontend-first MVP  
**Brand name:** VERA CLOTHING (working name; must be replaceable without restructuring the application)

## 1. Product vision

VERA CLOTHING is a polished, responsive online fashion store that makes discovering well-presented clothing, choosing the right variant, and managing a purchase feel simple and confident. The first delivery establishes a usable storefront experience and maintainable foundations. Later releases can connect secure customer accounts, persistent commerce data, order operations, and transactional email without redesigning the core product experience.

## 2. Target customers

- Fashion shoppers browsing on mobile or desktop who value clear photography, useful product information, and a low-friction shopping journey.
- Returning customers who want to save products, revisit a wishlist, and manage orders.
- Store operators (future) who need dependable product, variant, inventory, and order management.

## 3. Scope and release boundaries

### Core MVP — first frontend stage

- Responsive storefront shell and navigation branded VERA CLOTHING.
- Product browsing with category selection and product cards.
- Product detail experience with images, descriptions, price, and available size/color variants.
- Cart interactions: add items, change quantities, remove items, and review subtotal.
- Wishlist interactions from cards and product details; dedicated wishlist page; remove items; add a saved item to the cart; empty state; navigation count. Persist locally (local state with localStorage persistence as appropriate) and keep the feature behind a reusable boundary so it can later use Supabase.
- Checkout presentation and customer/order-detail form experience, clearly treated as a frontend flow only.
- Sensible loading, empty, validation, and error states; keyboard-accessible interactive controls.
- Sample/catalogue data may be local during this stage.
- The public product catalogue can be read from Supabase when project URL and publishable key are configured; without configuration the existing sample catalogue remains available. Wishlist/cart, checkout submission, and admin data remain local/mock.
- Admin dashboard frontend preview at `/admin` with overview, mock product create/edit/list, mock orders and customers, local settings UI, and a mock AI Product Assistant. Admin edits remain local to the admin session and do not change customer storefront data. The route is gated by the existing profile role, but admin data operations remain local and have no trusted backend authorization.
- Admin Settings includes a typed store-currency selector (default NGN). The selected currency is applied consistently to price displays and persisted locally; selecting a currency never performs exchange-rate conversion or mutates stored numeric prices.

The current frontend reads the public catalogue from Supabase when configured and supports customer email/password registration, sign-in, persistent sessions, profile display, and sign-out. Customer accounts use the existing `public.profiles` rows and the `customer` role; `/admin` is restricted to signed-in profiles with the existing `admin` role. It does **not** implement Google authentication, Mailgun, payment processing, or production order submission. Admin data and edits remain mock/local; the admin routes have a frontend role gate but admin operations are not yet connected to a privileged backend. Do not imply that a displayed checkout has actually charged a customer or submitted a durable order.

### Future features

- Supabase persistence for catalogue, customer profiles, wishlists, orders, order items, and variants.
- Google OAuth through Supabase Auth.
- Secure order placement and order history/status management.
- Mailgun order-confirmation emails triggered after successful order creation.
- Payment-provider integration, added only in a later approved stage.
- Move store currency settings from local persistence to an approved Supabase store-settings repository when the settings schema and admin authorization are designed.
- Connect the admin dashboard preview to Supabase, implement authentication and server-enforced admin-role authorization, and persist product, image, category, variant, inventory, and order management.
- Connect the AI Product Assistant UI to a secure backend/API and a selected AI provider. Suggestions remain drafts for owner review and must never automatically overwrite or publish product information.
- Inventory availability and stock-reservation rules; operational reporting and additional production safeguards.

## 4. Customer journey

1. Arrive at the storefront and explore featured products or a category.
2. Refine browsing by category (and later supported filters/sorting), then open a product.
3. Review product details and images, choose an available size/color combination, and add it to the cart or wishlist.
4. Open the wishlist to review saved products, remove a product, or move it to the cart.
5. Review the cart, update quantities/remove lines, and proceed to checkout.
6. In the first stage, review a non-transactional checkout interface. In the future flow, authenticate or continue according to the approved account policy, provide shipping details, pay through a provider, and receive a confirmed order and email.
7. In a future authenticated experience, view order history and status.

## 5. Pages and primary requirements

### Home / Shop

- Present VERA CLOTHING branding and clear routes to shopping and categories.
- Feature selected products and category entry points without overwhelming the page.
- Product cards show image, name, price, and a quick wishlist control; clicking the card opens product details.

### Product category / browsing

- Display a coherent product grid, category context, and useful empty state.
- Category navigation should be data-driven; avoid baking category names into layout logic.
- Filtering and sorting can be added incrementally and should reflect available catalogue data.

### Product details

- Show product imagery, name, price, description, and any relevant care/material information supplied by the catalogue. Products support zero to five ordered images; the first image is the initial main/featured image, and the detail page provides selectable thumbnails when multiple images exist.
- Product cards use only the first/main image rather than displaying the full gallery.
- Present available variants (at minimum size and color where applicable); prevent adding an unavailable/unselected required variant.
- Provide clear add-to-cart feedback and a wishlist heart control whose accessible label/state reflects whether the product is saved.

### Cart

- Show each selected product and chosen variant, quantity, unit price, and line subtotal.
- Allow quantity changes and line removal; calculate totals from cart state rather than user-entered values.
- Provide empty-cart state and a clear route back to shopping. Shipping, tax, discount, and final payment calculations are future backend/provider responsibilities.

### Wishlist

- Show all saved products with image, name, price, and selected actions.
- Allow removing a product and adding/moving it to the cart; variant selection must be requested if the product requires a variant.
- Show a helpful empty state with a path back to shopping.
- Show the current saved-item count in navigation, including a useful zero state without implying an error.
- First stage uses local state/localStorage; future authenticated users can sync to Supabase. Define how local and server wishlists merge at sign-in before implementing that future behavior.

### Checkout

- Provide a clear, responsive order review and customer/shipping details form with labels, validation, and actionable errors.
- First stage is a prototype frontend only: do not collect real payment credentials or report an order as successfully placed without a real order service.
- Future checkout validates prices, stock, address, and totals on a trusted server boundary; payment processing must be separately approved and integrated securely.

### Authentication and account

- Email/password sign-in and registration use Supabase Auth. Restore sessions across page refreshes, show credential errors, and provide account details and sign-out.
- New customer profiles use the existing `public.profiles` table with `role = customer`; profile creation requires the existing self-scoped insert policy or a trusted signup trigger. The frontend does not change database schema or policies.
- Restrict `/admin` to signed-in profiles with `role = admin`. Admin dashboard data and edits remain mock/local and are not production-protected backend operations.
- Google sign-in remains a future feature.

### Orders and confirmation email (future)

- Create durable orders and order-item snapshots after an authorized, successful checkout.
- Expose order confirmation/details to the owning customer and manage lifecycle/status safely.
- Send a transactional confirmation email through Mailgun only after successful order persistence; email failure must not falsely undo or duplicate the order.

### Future admin and product/inventory management

- Restricted staff access only; customer-facing clients must not receive privileged keys or unrestricted write access.
- Manage products, categories, images, variant attributes, prices, publication state, and stock with validation and audit-friendly operations. Product image management supports add, replace, delete, reorder, and choosing the main image, while enforcing a maximum of five images per product.
- Manage orders and status transitions with clear authorization and safeguards against overselling.

## 6. Quality and acceptance principles

- Core storefront, product, cart, and wishlist flows work at mobile and desktop widths.
- Variant selection is explicit and reflected in cart lines; distinct variant combinations remain distinct cart items.
- Wishlist can be added to from multiple surfaces and remains consistent between those surfaces and navigation.
- Forms and controls are keyboard-operable, have accessible names, and communicate validation/state.
- Brand identity and catalogue data are configuration/data concerns, not structural dependencies.
- No integration secret is embedded in browser code; future access is enforced server-side/database-side.
- MVP success is a clear, trustworthy shopping prototype—not a claim of production payment or fulfillment capability.
