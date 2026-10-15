# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

E-commerce / catalog site for an auto spare-parts business (Spanish-language, Argentina). Users browse and search a parts catalog by category/brand/price, register and log in, add items to a cart, and submit orders ("reservas") for an admin to process — this is a B2B reservation flow, not an online checkout with payment. There's also an admin panel for managing products (bulk Excel import/export), users (accept/deny registrations, set per-user discounts), and orders.

This is an older codebase the owner is incrementally modernizing. Expect inconsistent patterns (mixed Spanish/English naming, some dead/commented-out code, ad-hoc admin scripts) rather than a clean reference architecture.

## Repository structure

- `client/` — React 18 + Vite SPA (deployed to Vercel)
- `server/` — Express + Mongoose API (deployed to Render)
- `infrastructure/typesense/` — local Docker Compose setup for a Typesense search server. Its data directory (`infrastructure/typesense/data/`) is gitignored and untracked (was previously committed by accident); it's regenerated locally by Docker/`typesense-sync`, never edit it by hand.

## Commands

### Client (`client/`)
```
npm run dev       # vite dev server (--host, http://localhost:5173)
npm run build     # vite build
npm run lint      # eslint . --ext js,jsx --max-warnings 0
npm run preview   # preview production build
```
No test runner is configured for the client.

### Server (`server/`)
```
npm run dev        # nodemon, NODE_ENV=development, http://localhost:5000
npm run start       # node, NODE_ENV=production

npm run typesense-sync         # one-time reindex of MongoDB products -> Typesense
npm run typesense-sync:reset   # drop + recreate the Typesense collection and reindex

npm run reset-password -- <email> <nuevaContraseña>   # emergency password reset (production)
npm run restore-stock          # dry-run: lists products with stock <= 0
npm run restore-stock:apply    # sets them to stock 10 and syncs Typesense
npm run integrity-report       # read-only data integrity report (no PII), run before data migrations
npm run fix-data               # dry-run of the E2 data fixes (emails, orphan carts, bad prices, indexes)
npm run fix-data:apply
npm run typesense-keys         # creates scoped Typesense keys (search / write for products, dev for products_dev) and verifies their permissions; needs the master key
```
No test runner is configured for the server. `scripts/` contains maintenance scripts that run against production (`NODE_ENV=production`, reads `server/.env.production`) — read a script before running it. Old one-off rubro/subrub migration scripts were removed (they weren't idempotent; see git history if needed).

### Typesense (local dev)
```
cd infrastructure/typesense
docker compose up -d   # requires infrastructure/typesense/.env (TYPESENSE_API_KEY, TYPESENSE_PORT, TYPESENSE_VERSION)
```
The Express server degrades gracefully if Typesense is unreachable: it starts listening without waiting for it, and searches fall back to a simpler Mongo regex search (`mongoFallbackSearch`, response has `degraded: true`), so it isn't strictly required for local dev.

## Architecture

### Client
- **Routing**: single `Routes` tree in `src/App.jsx`. Most routes gate on `authUser` from `AuthContext` and redirect unauthenticated users to `AuthPage` (or `/`) inline rather than via a shared `PrivateRoute` component.
- **Global state**: two React Contexts, no external state library.
  - `AuthContext` (`src/context/AuthContext.jsx`) — fetches `/api/auth/authUser` on mount (cookie-based session), exposes `authUser`, `isAdmin` (derived from `role === "admin"`), `accepted`, and `refreshAuthUser`/`setAuthUser`.
  - `CartContext` (`src/context/CartContext.jsx`) — loads the cart from `authUser.cart._id`, exposes `addProductToCart`, `handleDeleteProdFromCart`, `finishPurchase` (single `POST /api/order`; the server builds the order from the stored cart and empties it). Uses SweetAlert2 (`sweetalert2`) for all user-facing confirm/error dialogs instead of custom UI.
- **API calls**: plain `axios` calls per-component/hook (`src/hooks/*`, `src/services/*`) against `API_URL` (`src/utils/api_url.js` — `http://localhost:5000` in dev, `VITE_PROD_SERVER_URL` in prod), always with `withCredentials: true` since auth is an httpOnly cookie. There is no shared axios instance/interceptor.
- **Search/browse**: product hooks call `GET /api/products` with either a `search` query param (routed server-side to Typesense) or category/brand/price filters (routed to Mongo).
- **Styling**: Tailwind CSS (custom color palette and breakpoints in `client/tailwind.config.js`), plus a couple of standalone `.css` files for specific pages/components.
- **Deploy**: Vercel; `vercel.json` rewrites all paths to `/` for SPA client-side routing. A GitHub Action (`client/.github/workflows/keep-alive.yml`) pings the Vercel frontend and the Render backend's `/api/health` every 5 minutes (GET returns `{ mongo, typesense }`) to avoid Render free-tier cold starts.

### Server
- **Entry point**: `server.js` wires middleware (`express.json`, `cookie-parser`, `cors` with an explicit prod/dev origin allowlist), mounts routers under `/api/*`, then connects to MongoDB and starts listening; ensuring the Typesense collection exists and the maintenance jobs run in the background afterwards (a down or hanging Typesense never delays startup).
- **Config**: `server/config/envConfig.js` loads `.env` or `.env.production` (by `NODE_ENV`) via `dotenv` and re-exports each var individually — this is the single place env vars are read; other modules import from here, not `process.env` directly.
- **Auth**: JWT stored in an httpOnly cookie (`utils/jwt.js`), `authenticateJWT` middleware sets `req.user = { userId }`. Passwords hashed with bcrypt (`utils/bcrypt.js`). Roles: `user` / `admin` / `premium` (`models/user.model.js`); registration always creates `role: "user"` (there's no email verification, so never auto-promote by email); admins are set directly in the DB. New users default to `accepted: false` and must be approved via `PUT /api/user/accept/:userId`.
- **Authorization**: `utils/jwt.js` also exports `requireAdmin` (looks up `req.user.userId`'s role in Mongo; must run after `authenticateJWT`). Every mutating/admin endpoint across `routes/*.routes.js` requires at least `authenticateJWT`, and admin-only ones (bulk product edits, Excel import/export, user management, order list/delete, etc.) require `authenticateJWT + requireAdmin`. Endpoints scoped to a specific user's own data (cart get/add/remove, creating an order) instead check ownership inline in the controller (`req.user.userId` vs. the resource's `userId`) rather than trusting route params/body — e.g. `createNewOrder` ignores the request body entirely: it atomically empties the authenticated user's cart (so double-submits can't duplicate orders), snapshots each line (codpro, desc_stock, unitPrice, quantity) plus a `customer` copy, and computes `subtotal` (list) and `totalOrder` with the user's cascading discounts (`utils/discounts.js`, mirrored in `client/src/utils/discounts.js`). Orders created before this only have `{ product, quantity }` and rely on populate. Client-side route guards in `App.jsx` (`/admin`, `/admin/:manage`, `/reservas`) check `isAdmin` to match.
- **Data model** (Mongoose, `server/models/`): `User` → `Cart` (1:1 ref). Deleting a user (`deleteUser`) deletes their cart but keeps their orders as history (orders carry a `customer` snapshot; no Mongoose cascade hooks). `Product` uses `strict: false` (extra fields are persisted even if not in the schema) with a fixed `desc_marca` enum of car brands and several MongoDB text/compound indexes for the pre-Typesense search. Products are categorized by a 3-level hierarchy: `desc_rubro` (category) → optional `desc_subrubro_intermedio` (intermediate subcategory) → `desc_subrub` (final subcategory), plus numeric `rubro`/`subrub`/`proveed` codes.
- **Search architecture**: `controllers/product.controller.js` is the core of the app.
  - `GET /api/products` with a `search` param routes to Typesense (`typesenseSearch`), which tokenizes the query into "code" tokens (contain digits, e.g. part codes) vs "text" tokens and runs different strategies: pure code (infix match on `codpro`/`codpro_suffix`), pure text (fielded search across description/brand/category with typo tolerance), or mixed (two parallel Typesense queries merged/ranked so results matching both code and text outrank partial matches; the candidate pool grows with the requested page up to Typesense's 250 max). Searches use `searchClient` (`typesense/client.js`: 1 s timeout, 2 attempts — the library treats `numRetries: 0` as 3) and fall back to `mongoFallbackSearch` on any error; writes/sync use the default client (8 s). Clients use `TYPESENSE_SEARCH_KEY`/`TYPESENSE_WRITE_KEY` (scoped keys) and fall back to `TYPESENSE_ADMIN_API_KEY`.
  - `GET /api/products` without `search` (plain category/brand/price browsing) queries MongoDB directly with cursor-based (`lastId`) pagination instead of Typesense, since exact filters don't benefit from search. `total` is only computed on the first page (`null` with `lastId`).
  - **Latency matters more than query cost**: Atlas is in São Paulo and Render in Oregon (~200 ms per round trip), so minimize sequential queries per request. In-memory caches (`utils/memoCache.js`): categories tree, highlighted products and intermediate-subcategory names (`invalidateCatalogCaches()` — call it from any code that changes products) and per-user price access in `resolvePriceAccess` (60 s; `invalidatePriceAccess(userId)` on accept/deny/delete). `getAuthUser` loads user + cart + cart products in one `$lookup` aggregation and hydrates them so the response matches `populate`. Fine for a single Render instance; revisit if scaling to several.
  - Typesense is kept eventually-consistent with Mongo: single-doc mutations call `upsertToTypesense`/`deleteFromTypesense`; bulk ones (Excel upload, `updateMany`-by-filter, `deleteMany`) call `syncFilterToTypesense(filter)` / `deleteIdsFromTypesense(ids)` (fetch ids *before* deleting). All of these swallow errors so Typesense outages never fail a Mongo write. Any new product-mutating code must do the same, or search results (which come from Typesense) go stale. Any direct Mongo edit outside the API (scripts, Atlas UI) needs `npm run typesense-sync` afterwards. The maintenance jobs (`jobs/maintenance.js`) sync too.
  - The old Postman-only bulk maintenance endpoints (add/rename/delete fields on all products, delete whole collection/rubro, image bulk-setters, update-stock, `GET/PUT /api/user/:userId`, add-clientId) were removed for security; recover them from git history only if really needed, and add Typesense sync + validation if so.
  - Collection name depends on `NODE_ENV` (`typesense/collection.js`): `products` in production, `products_dev` otherwise, because the dev `.env` may point at the production Typesense host. Never write to `products` from a dev Mongo — that previously left ~1500 duplicate docs with stale prices in production search. The sync script enforces this via `assertCollectionMatchesEnv()`. `typesense/typesenseSync.js` is the batch/one-time (re)indexer and also exports `mongoToTypesense`, the canonical Mongo→Typesense document mapper reused by the controller — its signature is depended on, don't change it casually.
  - The Typesense collection schema lives in `typesense/collection.js` and is expected to mirror the `Product` model's searchable fields.
- **Background jobs**: `jobs/maintenance.js` runs idempotent tasks on startup and every hour (plain `setInterval`, no queue): `expireHighlights` turns off `destacado` for products whose `fechaFinDestacado` passed and syncs Typesense. `expireCarts` empties carts that had no change for 24 h (`Cart` has `timestamps`; any add/remove resets the clock). Agenda was removed because it lost scheduled jobs on every restart; new periodic work should be added to the `TASKS` list as an idempotent query, not as a one-shot scheduled job. `GET /highlight/products` also filters by `fechaFinDestacado` so an expired highlight never shows between runs. `reconcileTypesense` runs on startup and then once a day: full upsert of all products plus deletion of Typesense docs missing from Mongo (skipped if that would delete more than half the index, as a safety guard). (The old `productHighlightJobs` Mongo collection is unused and can be dropped.)
- **Bulk product import/export**: `uploadExcelProducts`/`downloadExcelProducts` use `xlsx` + `multer` (in-memory, 10MB limit) to bulk upsert/export products by category from Excel files — this is the primary way the admin maintains the catalog, not a one-off script.
- **Images**: Cloudinary (`config/cloudinaryConfig.js`) is configured but not imported anywhere; products just store an `imageUrl` string (preserved across Excel uploads). There is currently no API endpoint to change a product's image.
- **DB connection**: `db/dbConnection.js` picks Mongo Atlas (`mongodb+srv://...cluster-repuestos...`) in production vs. local `mongodb://DB_HOST:DB_PORT` in development, with pooling/timeout options tuned for a free-tier cluster; exits the process (`process.exit(1)`) if the initial connection fails.

### Environment variables
Server (`server/.env` / `.env.production`, loaded via `envConfig.js`): `NODE_ENV`, `PORT`, `DB_PORT`, `DB_HOST`, `DB_USER_NAME`, `DB_USER_PASSWORD`, `JWT_TOKEN_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_URL`, `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`, `TYPESENSE_ADMIN_API_KEY` (master key; only needed by `typesense-keys` and full resets once scoped keys are set), `TYPESENSE_WRITE_KEY`, `TYPESENSE_SEARCH_KEY`.

Client (`client/.env`): `VITE_PROD_SERVER_URL`.

Typesense infra (`infrastructure/typesense/.env`): `TYPESENSE_API_KEY`, `TYPESENSE_PORT`, `TYPESENSE_VERSION`.
