# Architecture — VERA CLOTHING

**Status:** Customer storefront can read the public catalogue from Supabase and supports email/password Auth with profile-backed role gating. Admin data writes, Google OAuth, orders, Storage uploads, email, and payments remain future work.

## 1. Goals and constraints

Build a maintainable, responsive clothing storefront that can grow from local sample data and browser-persisted wishlist state into a production commerce application. Keep branding replaceable, domain logic reusable, and trusted operations outside the browser. The customer catalogue and email/password Auth use the configured public Supabase client; Google OAuth, Mailgun, payments, and privileged admin operations remain unimplemented.

## 2. Planned technology

- **React** for reusable UI and composable features.
- **Vite** for local development and frontend builds.
- **Tailwind CSS** for responsive styling using the design tokens in STYLE.md.
- **React Router** for route-level pages (shop, category, product, cart, wishlist, checkout, and future account/order pages).
- **Supabase** for the public product catalogue and customer email/password Auth; future commerce persistence and Storage remain staged.
- **Google OAuth** (future) configured in Google Cloud Console and enabled through Supabase Auth; never implement a separate client-side credential flow.
- **Mailgun** (future) for server-triggered transactional order-confirmation email.

Avoid adding state-management or data-fetching dependencies until actual complexity justifies them. Encapsulate state and I/O so a later provider can replace the frontend-only implementation.

## 3. Frontend boundaries

Suggested feature-oriented organization (adapt to the actual scaffold without overengineering):

- `app/`: application entry, router, global providers.
- `pages/`: route-level composition only.
- `features/catalog/`: product/category types, cards, listing/detail components, catalogue access interface.
- `features/catalog/catalogRepository.ts` and `CatalogContext.tsx`: public catalogue data boundary; uses Supabase when environment configuration exists and the existing local sample catalogue otherwise.
- `features/auth/AuthContext.tsx`: persistent Supabase session restoration, email/password sign-in/registration, customer profile loading/initialization, and sign-out.
- `features/cart/`: cart state, line identity, totals presentation, cart components.
- `features/wishlist/`: isolated wishlist state and persistence adapter, reusable heart control, wishlist page.
- `features/checkout/`: frontend form and order-review presentation; no payment secrets or trusted pricing authority.
- `features/admin/`: admin data contracts and replaceable data provider; currently supplies mock products, orders, and customers for the admin UI.
- `features/currency/CurrencyContext.tsx` with `config/currency.ts`: typed store-currency setting, one currency catalogue/formatter, and local persistence adapter.
- `pages/Admin*.tsx` and `components/AdminLayout.tsx`: admin route pages and responsive navigation shell, isolated from the customer storefront layout.
- `components/`: shared navigation, buttons, form controls, layout, and feedback states.
- `config/`: centralized brand configuration (name, logo asset, colors/theme tokens, contact/social links) and non-secret public configuration.
- `lib/` or `services/`: typed interfaces/adapters for catalogue, wishlist, cart, and future backend calls.

Keep components presentational where possible. Put domain decisions (variant identity, wishlist toggling, cart line updates) in focused hooks/services rather than duplicating behavior across pages. Route pages should consume feature APIs, not directly couple themselves to storage implementation.

### First-stage data and persistence

- Use a typed local/sample catalogue; identify it clearly as development data.
- Represent a product's ordered image references as `images: string[]`, limited to five by a reusable catalogue-boundary validator. The first image is the default main/featured image; an empty array is valid and the UI presents an image placeholder.
- Product image references remain strings so local URLs can later be replaced with Supabase Storage paths/URLs without redesigning the product page. Keep cards on the first image and use the ordered list for detail-page thumbnails.
- Cart and wishlist may use local state and localStorage for the frontend stage. Validate and version persisted data when loading; handle missing, malformed, or stale records gracefully.
- Keep wishlist operations behind an interface (for example, list/add/remove/toggle) so a local adapter can later be replaced by an authenticated Supabase adapter without rewriting heart buttons or wishlist page.
- A wishlist entry should identify a product; if wishlisting specific variants becomes a product requirement, evolve the key/schema explicitly rather than assuming it.
- Never store payment credentials or sensitive customer data in localStorage.

### Store currency setting

- Store currency is a typed `CurrencyCode` selected from the centralized `currencies` configuration. NGN is the default. One `Intl.NumberFormat` helper formats product, cart, checkout, order, customer-spend, and admin preview prices.
- Admin → Settings updates the shared currency context immediately. The selected ISO currency code is persisted with the existing versioned local-storage helper, so it survives page reloads in this frontend stage.
- Currency selection changes display formatting only. Product/order numeric amounts and free-delivery threshold values are not converted or mutated by the selector.
- Keep persistence behind the `CurrencyContext` boundary. A future store-settings repository can load/save the code in the approved Supabase store settings model; no database schema or query is introduced for currency in this stage.

### Supabase client and public catalogue connection

- `src/lib/supabase.ts` creates the official Supabase JavaScript client only when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are provided. The browser client accepts only the publishable/anon key. Never add a service-role or secret key to a Vite variable or browser bundle.
- Fill the ignored `.env.local` (or copy `.env.example` over it) with the project URL and publishable key from Supabase project settings, then restart Vite after changing environment variables. No project credentials are included in the repository.
- The current catalogue repository reads the existing flat `public.products` fields `id`, `name`, `description`, `category` (text), `price`, `stock`, and `is_active`. It does not embed a `categories` relationship. The current schema probe found no `categories` foreign-key relationship, no `base_price`/`status` columns, and no embedded image/variant relationships; until those existing structures are provided, mapped products use the supported flat values and neutral empty image/variant defaults. Adapt only to actual deployed columns; do not alter the database schema as part of this connection.
- The customer storefront retains local sample data when no credentials are configured. If a configured query fails, it keeps the existing preview data but displays an explicit connection-failure notice; an empty successful Supabase result remains empty and is not replaced with fabricated products.
- Public reads require appropriate existing Supabase grants/RLS policies. No database policies/schema are changed by the frontend. The shared client enables persistent Auth sessions, automatic refresh, PKCE, and callback URL detection while using only the public publishable key.
- Cart and wishlist persistence remain local. Admin product/order/customer views and edits remain mock/local and are intentionally not written to Supabase; admin role protection and persistent admin access require authentication and server-enforced authorization first.

### Customer authentication and profiles

- Email/password sign-in delegates credential validation to Supabase Auth. The app restores the SDK-persisted session and observes changes with `onAuthStateChange`.
- Registration creates an Auth user with `full_name` metadata only. Authorization roles are never supplied through editable user metadata. With an authenticated session, the app reads the user's existing profile or inserts the user's ID, email, full name, and `role: customer` into the existing `public.profiles` table. Existing profile rows and roles are never overwritten.
- If email confirmation is required, registration displays a confirmation message. After the customer confirms and next signs in, profile initialization runs under the authenticated session. A trusted existing auth-user trigger may create the profile earlier. Initialization depends on existing self-scoped RLS policies or that trigger; no schema or policy changes are made by this frontend.
- The `/admin` route gate permits only a loaded `public.profiles.role === 'admin'`. This blocks normal customer UI access, but is not a substitute for server-side/RLS authorization for future admin data APIs.
- Sign-out calls Supabase Auth. Cart, wishlist, currency, checkout preview, and admin mock state remain otherwise unchanged.

### Admin dashboard preview

- Admin routes live under `/admin` and render within their own layout. They use typed contracts and a React data context initialized with mock/local data; admin data has no Supabase persistence. A frontend route gate requires an authenticated profile with `role = admin`, while trusted authorization for future backend admin operations remains to be implemented.
- Admin product edits and order-status changes are in-memory preview state. Keep customer storefront sample data separate; the preview editor must not silently change the storefront catalogue.
- The admin product editor supports product fields, active state, size/color lists, and up to five image URL references (main image first). Image add/remove/reorder and preview are UI-only; no file upload is implemented. A future repository/service adapter can replace mock reads/writes with authorized Supabase queries without changing the presentation components.
- Mock customer/order data is for demonstration only. No actual personal customer records, orders, or transactions are represented.

### AI Product Assistant UI preview

- The `/admin/ai-assistant` page provides deterministic mock suggestions for product copy, short copy, names, category, tags, and social captions. Admins can review/select/edit suggestions and save local drafts; the assistant does not write to products or publish content.
- A future secure server/API boundary must authenticate and authorize the store owner, keep provider secrets server-side, and return editable suggestions only. Keep the current mock generator behind a replaceable service seam; do not add an AI SDK or key to the frontend.

## 4. Supabase data model (proposed)

Use UUID primary keys, timestamps in UTC, foreign keys, indexes for common lookups, and explicit constraints. Exact column types and policies are to be finalized in migrations before integration.

### `profiles` (application user profile)

- `id uuid primary key references auth.users(id) on delete cascade`
- `email text` (synchronized/derived carefully; not the authorization source)
- `full_name text`, optional `avatar_url text`
- `created_at timestamptz`, `updated_at timestamptz`

Supabase Auth owns credentials and provider identities; do not duplicate passwords. Add a profile row through a trusted/controlled signup trigger or server operation and define how profile updates are authorized.

### `products`

- `id uuid primary key`, `slug text unique`, `name text`, `description text`
- `category_id uuid references categories(id)` (or an agreed category model)
- `base_price numeric(12,2)`, `currency char(3)`
- `status` (draft/active/archived), optional material/care fields
- `created_at`, `updated_at`

A `categories` table is recommended for stable, data-driven category navigation (`id`, unique `slug`, `name`, optional `description`, `sort_order`, active flag, timestamps).

### `product_images`

- `id uuid primary key`, `product_id uuid references products(id) on delete cascade`
- `storage_path text` (or controlled public URL), `alt_text text`, `sort_order integer`, optional `variant_id` when variant-specific media is needed
- timestamps

Store image files in a Supabase Storage bucket with policies; store paths/metadata in PostgreSQL. Avoid relying on arbitrary client-provided URLs. `sort_order` defines the ordered image list, with the first image treated as main/featured. Enforce the maximum of five images per product in the trusted catalogue/admin write path (and a transaction/trigger if database-level enforcement is needed); image administration will add, replace, delete, reorder, and set the first/main image without changing storefront contracts.

### `product_variants`

- `id uuid primary key`, `product_id uuid references products(id) on delete cascade`
- `sku text unique`, `size text`, `color text` (or normalized attributes if complexity warrants)
- optional `price_override numeric(12,2)`, `stock_quantity integer`, `is_active boolean`
- unique constraint for the chosen product/size/color identity; timestamps

Represent purchasable combinations as variants so stock and SKU belong to a specific sellable option. Enforce non-negative stock and validate availability on the trusted order path.

### `orders`

- `id uuid primary key`, `user_id uuid references profiles(id)` (nullable only if guest checkout is later approved)
- `status` (pending/confirmed/fulfilled/cancelled/refunded as applicable)
- `currency char(3)`, `subtotal numeric(12,2)`, `shipping_amount numeric(12,2)`, `tax_amount numeric(12,2)`, `total_amount numeric(12,2)`
- shipping/contact snapshot fields needed to fulfill the purchase; minimize and protect personal data
- optional unique provider reference/idempotency key; timestamps

Totals and status must be validated or assigned in trusted code, not trusted from a browser request. Define retention and privacy policies for address/contact snapshots.

### `order_items`

- `id uuid primary key`, `order_id uuid references orders(id) on delete cascade`
- `product_id uuid references products(id)`, `variant_id uuid references product_variants(id)` (nullable only for non-variant products)
- `quantity integer check (quantity > 0)`, `unit_price numeric(12,2)`, `line_total numeric(12,2)`
- immutable-at-purchase snapshots such as `product_name`, `sku`, `selected_size`, `selected_color`

Snapshot purchase details so order history remains meaningful if catalogue data later changes. Avoid cascading product deletion into historical order lines.

### `wishlist_items`

- `id uuid primary key`, `user_id uuid references profiles(id) on delete cascade`
- `product_id uuid references products(id) on delete cascade`, `created_at timestamptz`
- unique constraint `(user_id, product_id)` and indexes on `user_id` and `product_id`

If wishlists later need variant-specific selections, add a nullable `variant_id` and revise uniqueness semantics deliberately.

### Security and access policies

- Enable Row Level Security on customer-owned tables. Customers may select/modify only their own profile (per allowed fields), wishlist, and orders/order items; public catalogue access is limited to published products and active variants.
- Never expose Supabase service-role credentials in Vite/browser variables. Public anon keys are not secrets but must be paired with correct RLS.
- Restrict admin writes to a verified staff role enforced by trusted policy/claims, not a UI flag.
- Validate inputs, prices, inventory, and order transitions in a trusted server-side boundary; use transactions/idempotency for order creation and stock changes.

## 5. Future communication flows

### Catalogue and wishlist

React route components consume the catalogue context. Without environment configuration, the existing local sample catalogue is used; with configuration, a Supabase repository reads the public published catalogue and maps image rows into the existing ordered string-array contract. Wishlist remains browser-persisted for now; a later authenticated Supabase adapter can persist wishlist changes with a documented local-to-account merge policy at sign-in. UI controls continue to consume feature APIs.

### Google authentication

1. Configure the Google OAuth consent/client in Google Cloud Console and authorized redirect URIs.
2. Configure Google as a provider in Supabase Auth and set allowed application URLs/redirects.
3. The frontend invokes Supabase Auth OAuth methods and handles the redirect/session; it does not contain a Google client secret.
4. Supabase validates the identity and issues a session; PostgreSQL RLS uses the authenticated user identity to isolate data.
5. Create/synchronize the `profiles` record through a controlled database/server mechanism. Handle logout, token refresh, failures, and account deletion.

### Order and Mailgun

1. Frontend sends selected variant IDs, quantities, and customer/shipping inputs to a trusted order endpoint (for example, a Supabase Edge Function); browser totals are informational only.
2. Trusted logic authenticates the user, reloads current prices/stock, validates the request, and writes the order plus immutable item snapshots transactionally with idempotency and inventory safeguards.
3. After successful persistence, trusted server-side code calls Mailgun using a secret stored only in server-side environment/secrets. The message contains the confirmed order summary and is sent to the verified customer address.
4. Record delivery attempts/status as needed; retry email independently without creating a duplicate order. Do not expose Mailgun credentials or let the browser mark an order confirmed.

Payment-provider integration is a separate future design decision and is intentionally out of scope for the initial frontend stage.

### Future owner-only AI product assistant

Treat AI copy suggestions as an optional owner tooling capability, separate from the public storefront and product persistence. A future restricted admin UI may send an owner's product inputs to a trusted backend/API endpoint; that server-side boundary will authenticate and authorize the owner, hold any AI provider key in server-side secrets, validate provider output, and return suggestions as editable drafts. Do not call an AI provider directly from React or expose a provider key in Vite variables. The UI must allow generating/regenerating suggestions, choosing one, editing it, or writing original content, then explicitly saving the owner's final version. Suggestions must never overwrite or publish catalogue data automatically; saving and publishing remain separate, owner-confirmed actions. No AI SDK, key, endpoint, or generation behavior is part of the first frontend stage.

## 6. Branding and configuration

Keep VERA CLOTHING name, logo asset, theme/color tokens, and configurable brand links in one small brand/configuration surface. Components consume semantic tokens (for example, brand, surface, text, accent) rather than scattering literal brand values. A later rebrand should require configuration/assets and content changes, not route or domain-model rewrites.

## 7. Delivery sequence

1. Frontend shell, responsive navigation, sample catalogue, browsing, product details, variants.
2. Cart and isolated local wishlist with empty/loading/feedback states; checkout presentation only.
3. Accessibility and responsive validation; document remaining prototype limitations.
4. Later approved stage: verify/align live public-read and profile RLS policies; add Google OAuth if approved and server-enforce admin authorization; then secure wishlist and order persistence, inventory, Mailgun, the AI provider boundary, and separately approved payment integration.
