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

npm run update-users
npm run fix-rubro-subrub:dry     # --dry-run
npm run fix-rubro-subrub
npm run fix-rubro-subrub-bulk
npm run fix-rubro-subrub-products
```
No test runner is configured for the server. `scripts/` contains one-off/maintenance data-migration scripts (category/subcategory ("rubro"/"subrub") cleanups) — read a script before running it against production data.

### Typesense (local dev)
```
cd infrastructure/typesense
docker compose up -d   # requires infrastructure/typesense/.env (TYPESENSE_API_KEY, TYPESENSE_PORT, TYPESENSE_VERSION)
```
The Express server degrades gracefully if Typesense is unreachable (search falls back conceptually to Mongo, see below), so it isn't strictly required for local dev.

## Architecture

### Client
- **Routing**: single `Routes` tree in `src/App.jsx`. Most routes gate on `authUser` from `AuthContext` and redirect unauthenticated users to `AuthPage` (or `/`) inline rather than via a shared `PrivateRoute` component.
- **Global state**: two React Contexts, no external state library.
  - `AuthContext` (`src/context/AuthContext.jsx`) — fetches `/api/auth/authUser` on mount (cookie-based session), exposes `authUser`, `isAdmin` (derived from `role === "admin"`), `accepted`, and `refreshAuthUser`/`setAuthUser`.
  - `CartContext` (`src/context/CartContext.jsx`) — loads the cart from `authUser.cart._id`, exposes `addProductToCart`, `handleDeleteProdFromCart`, `finishPurchase` (creates an order then empties the cart). Uses SweetAlert2 (`sweetalert2`) for all user-facing confirm/error dialogs instead of custom UI.
- **API calls**: plain `axios` calls per-component/hook (`src/hooks/*`, `src/services/*`) against `API_URL` (`src/utils/api_url.js` — `http://localhost:5000` in dev, `VITE_PROD_SERVER_URL` in prod), always with `withCredentials: true` since auth is an httpOnly cookie. There is no shared axios instance/interceptor.
- **Search/browse**: product hooks call `GET /api/products` with either a `search` query param (routed server-side to Typesense) or category/brand/price filters (routed to Mongo).
- **Styling**: Tailwind CSS (custom color palette and breakpoints in `client/tailwind.config.js`), plus a couple of standalone `.css` files for specific pages/components.
- **Deploy**: Vercel; `vercel.json` rewrites all paths to `/` for SPA client-side routing. A GitHub Action (`client/.github/workflows/keep-alive.yml`) pings the Vercel frontend and the Render backend's `/api/health` every 5 minutes to avoid Render free-tier cold starts.

### Server
- **Entry point**: `server.js` wires middleware (`express.json`, `cookie-parser`, `cors` with an explicit prod/dev origin allowlist), mounts routers under `/api/*`, then connects to MongoDB, starts Agenda, and (non-fatally) ensures the Typesense collection exists before listening.
- **Config**: `server/config/envConfig.js` loads `.env` or `.env.production` (by `NODE_ENV`) via `dotenv` and re-exports each var individually — this is the single place env vars are read; other modules import from here, not `process.env` directly.
- **Auth**: JWT stored in an httpOnly cookie (`utils/jwt.js`), `authenticateJWT` middleware sets `req.user = { userId }`. Passwords hashed with bcrypt (`utils/bcrypt.js`). Roles: `user` / `admin` / `premium` (`models/user.model.js`); one hardcoded email is auto-promoted to `admin` on registration (`auth.controller.js`). New users default to `accepted: false` and must be approved via `PUT /api/user/accept/:userId`.
- **Authorization**: `utils/jwt.js` also exports `requireAdmin` (looks up `req.user.userId`'s role in Mongo; must run after `authenticateJWT`). Every mutating/admin endpoint across `routes/*.routes.js` requires at least `authenticateJWT`, and admin-only ones (bulk product edits, Excel import/export, user management, order list/delete, etc.) require `authenticateJWT + requireAdmin`. Endpoints scoped to a specific user's own data (cart get/add/remove, emptying a cart, creating an order) instead check ownership inline in the controller (`req.user.userId` vs. the resource's `userId`) rather than trusting route params/body — e.g. `createNewOrder` always uses `req.user.userId` as the order owner, ignoring any `userId` in the request body. Client-side route guards in `App.jsx` (`/admin`, `/admin/:manage`, `/reservas`) check `isAdmin` to match.
- **Data model** (Mongoose, `server/models/`): `User` → `Cart` (1:1 ref) and cascade-deletes `Cart`/`Order` on user delete via pre-hooks (only `findOneAndDelete`/`remove`, not `deleteOne` on a query). `Product` uses `strict: false` (extra fields are persisted even if not in the schema) with a fixed `desc_marca` enum of car brands and several MongoDB text/compound indexes for the pre-Typesense search. Products are categorized by a 3-level hierarchy: `desc_rubro` (category) → optional `desc_subrubro_intermedio` (intermediate subcategory) → `desc_subrub` (final subcategory), plus numeric `rubro`/`subrub`/`proveed` codes.
- **Search architecture**: `controllers/product.controller.js` is the core of the app.
  - `GET /api/products` with a `search` param routes to Typesense (`typesenseSearch`), which tokenizes the query into "code" tokens (contain digits, e.g. part codes) vs "text" tokens and runs different strategies: pure code (infix match on `codpro`/`codpro_suffix`), pure text (fielded search across description/brand/category with typo tolerance), or mixed (two parallel Typesense queries merged/ranked so results matching both code and text outrank partial matches).
  - `GET /api/products` without `search` (plain category/brand/price browsing) queries MongoDB directly with cursor-based (`lastId`) pagination instead of Typesense, since exact filters don't benefit from search.
  - Typesense is kept eventually-consistent with Mongo: single-doc mutations call `upsertToTypesense`/`deleteFromTypesense`; bulk ones (Excel upload, `updateMany`-by-filter, `deleteMany`) call `syncFilterToTypesense(filter)` / `deleteIdsFromTypesense(ids)` (fetch ids *before* deleting). All of these swallow errors so Typesense outages never fail a Mongo write. Any new product-mutating code must do the same, or search results (which come from Typesense) go stale. Maintenance endpoints that `updateMany({})` the whole collection don't sync — run `npm run typesense-sync` after using them. The `unhighlight-product` Agenda job syncs too.
  - Collection name depends on `NODE_ENV` (`typesense/collection.js`): `products` in production, `products_dev` otherwise, because the dev `.env` may point at the production Typesense host. Never write to `products` from a dev Mongo — that previously left ~1500 duplicate docs with stale prices in production search. The sync script enforces this via `assertCollectionMatchesEnv()`. `typesense/typesenseSync.js` is the batch/one-time (re)indexer and also exports `mongoToTypesense`, the canonical Mongo→Typesense document mapper reused by the controller — its signature is depended on, don't change it casually.
  - The Typesense collection schema lives in `typesense/collection.js` and is expected to mirror the `Product` model's searchable fields.
- **Background jobs**: `agenda.js` configures Agenda (Mongo-backed job queue) with a single job type, `unhighlight-product`, used to auto-expire a product's "destacado" (featured) flag after N days (`highlightProduct`/`unhighlightProduct` in `product.controller.js`). Agenda uses its own Mongo connection string built the same way as `db/dbConnection.js` (duplicated, not shared).
- **Bulk product import/export**: `uploadExcelProducts`/`downloadExcelProducts` use `xlsx` + `multer` (in-memory, 10MB limit) to bulk upsert/export products by category from Excel files — this is the primary way the admin maintains the catalog, not a one-off script.
- **Images**: Cloudinary (`config/cloudinaryConfig.js`) is configured but most image-URL mutations in `product.controller.js` are ad-hoc admin endpoints that just set a `imageUrl` string field directly (e.g. `addImageToTornillos`, `addImageUrlToSubrub`) rather than going through an upload flow in this repo.
- **DB connection**: `db/dbConnection.js` picks Mongo Atlas (`mongodb+srv://...cluster-repuestos...`) in production vs. local `mongodb://DB_HOST:DB_PORT` in development, with pooling/timeout options tuned for a free-tier cluster; exits the process (`process.exit(1)`) if the initial connection fails.

### Environment variables
Server (`server/.env` / `.env.production`, loaded via `envConfig.js`): `NODE_ENV`, `PORT`, `DB_PORT`, `DB_HOST`, `DB_USER_NAME`, `DB_USER_PASSWORD`, `JWT_TOKEN_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_URL`, `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`, `TYPESENSE_ADMIN_API_KEY`, `TYPESENSE_SEARCH_API_KEY`.

Client (`client/.env`): `VITE_PROD_SERVER_URL`.

Typesense infra (`infrastructure/typesense/.env`): `TYPESENSE_API_KEY`, `TYPESENSE_PORT`, `TYPESENSE_VERSION`.
