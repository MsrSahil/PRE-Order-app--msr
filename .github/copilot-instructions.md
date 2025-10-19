### Overview

This repository is a two-part full-stack app (client + server):

- `client/` — React (Vite) single-page app. Entry: `client/src/main.jsx`. Dev: `npm run dev` from `client`.
- `server/` — Express + MongoDB API using ES modules. Entry: `server/index.js`. Dev: `npm run dev` from `server` (nodemon with dotenv).

Key integration points:
- Socket.io: server creates a `Server` in `server/index.js` and attaches it to requests as `req.io`. Controllers emit events (see `server/src/controllers/order.controller.js`).
- Payments: Razorpay integration lives in `server/src/controllers/payment.controller.js`. Webhook verification uses `RAZORPAY_WEBHOOK_SECRET` and is the source of truth for payment confirmation.
- Auth: server uses cookie-based sessions (JWT stored in httpOnly cookie). Client `client/src/config/axios.js` has `withCredentials: true` and baseURL `http://localhost:8000/api/v1`.

### What to prioritize for code changes

- Preserve socket usage: use `req.io.to(<roomId>).emit(...)` to notify restaurants (see `order.controller.js`). Avoid creating new socket instances — reuse `req.io` from requests.
- Razorpay: prefer webhook-driven payment confirmation rather than client-side verification (webhook handler in `payment.controller.js`).
- Keep request body size handling in mind: `server/index.js` sets JSON/urlencoded limits to `50mb` (images may be uploaded as base64).

### Environment variables (refer to `.env`)

Common variables referenced in the codebase:
- `PORT` — server port (default 8000)
- `MONGO_URI` — MongoDB connection string (`server/src/config/db.js`)
- `CORS_ORIGIN` — allowed origin for both server CORS and socket.io (used in `server/index.js`)
- `JWT_SECRET`, `JWT_EXPIRY` — auth tokens (see `server/src/models/user.model.js` and `auth.middleware.js`)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — payments
- `CLIENT_URL` — used for constructing reset links

When modifying code that depends on env vars, prefer to read them via `process.env.*` and maintain existing defaults where present.

### Developer workflows & commands

- Client (from repo root):
  - cd client; npm install; npm run dev — starts Vite dev server (HMR)
  - cd client; npm run build — produces production assets

- Server (from repo root):
  - cd server; npm install; npm run dev — starts nodemon with dotenv (uses `.env`)

Notes:
- Client expects backend at `http://localhost:8000/api/v1` (see `client/src/config/axios.js`). If you change the server port or run backend on a different hostname, update this file or `CORS_ORIGIN`.
- Socket.io rooms use restaurant IDs (stringified). Example emit: `req.io.to(restaurantId.toString()).emit('newOrder', order)`.

### Patterns & conventions specific to this project

- ES module imports ("type": "module" in package.json). Use `import`/`export` consistently.
- Async errors use `express-async-handler` + custom `ApiError`/`ApiResponse` wrappers (`server/src/utils/*`). When adding endpoints, wrap handlers with `asyncHandler` and throw `ApiError` for controlled errors.
- Models populate nested fields manually (see `Order` population in `order.controller.js`). Follow that populate pattern when returning orders.
- Role-based route protection uses middlewares in `server/src/middlewares/*` and client `ProtectedRoute` component in `client/src/components/layout/ProtectedRoute.jsx` — maintain the contract: server-side protects access by role and client-side renders/blocks routes.

### Files to inspect for examples

- `server/index.js` — server bootstrap, socket.io, error handling (look here for body-size limit and global error handler).
- `server/src/controllers/order.controller.js` — order lifecycle, socket emits, populate usage, cancellation window logic.
- `server/src/controllers/payment.controller.js` — Razorpay usage and webhook verification.
- `server/src/config/db.js` — MongoDB connection pattern.
- `client/src/config/axios.js` — baseURL and credentials.
- `client/src/main.jsx` and `client/src/App.jsx` — app bootstrap, auth session check, routes (dashboard/admin/customer separation).

### Quick examples you can use in PRs

- Emit new order to restaurant room:

  // server-side handler
  req.io.to(restaurantId.toString()).emit('newOrder', populatedOrder.toObject());

- Check an authenticated user in client bootstrap (already implemented):

  // client/src/main.jsx
  const response = await api.get('/users/me'); // api is axios instance with credentials

### Quality gates & testing notes

- There are no unit tests in the repo. Run the app locally to validate changes.
- After server edits, run `cd server; npm run dev` and check console logs for socket connections & webhook handlers.
- For frontend, run `cd client; npm run dev` and verify routes, protected routes, and API calls.

### When to ask for human review

- Any change to payment/webhook logic (sensitive financial flow).
- Changes to auth token generation/validation or cookie handling.
- Changes that affect socket room naming or event contracts (event names: `newOrder`, `orderStatusUpdate`).

If anything in this file is unclear or you want more examples (e.g., common request/response shapes), tell me which area to expand and I'll iterate.
