# PRE-Order-app--msr

Small full-stack food pre-order app (customer, restaurant dashboard, admin). This repo contains two parts:

- `client/` — React + Vite single-page app (customer UI, dashboards).
- `server/` — Express + MongoDB API with Socket.io and Razorpay integration.

## Quick start

Prerequisites: Node.js (16+), npm, MongoDB (or a hosted MongoDB URI).

1. Install dependencies

```powershell
# from repo root
cd client
npm install

cd ../server
npm install
```

2. Setup environment variables

Create `.env` in the `server/` folder. Minimum variables used by the app:

```
PORT=8000
MONGO_URI=mongodb://localhost:27017/preorder
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

3. Run the servers (dev)

```powershell
# Start server (nodemon watches server files)
cd server; npm run dev

# In a separate terminal, start client
cd client; npm run dev
```

Open the client URL printed by Vite (usually http://localhost:5173). The client expects the API at `http://localhost:8000/api/v1` by default (see `client/src/config/axios.js`). If you change the server port or host, update `CORS_ORIGIN` and the client axios baseURL.

## Architecture & key integration points

- Frontend (client): React + Redux (RTK slices in `client/src/features/*`). Routes and protected routes are in `client/src/App.jsx` and `client/src/components/layout/ProtectedRoute.jsx`.
- Backend (server): Express with ES modules. Entry point: `server/index.js`.
- Socket.io: The server attaches `io` to each request as `req.io` in `server/index.js`. Use `req.io.to(<roomId>).emit(...)` from controllers to send events (see `server/src/controllers/order.controller.js` for examples).
- Payments: Razorpay integration is in `server/src/controllers/payment.controller.js`. Payment confirmation is handled via webhooks — `RAZORPAY_WEBHOOK_SECRET` is required. The webhook handler is the source of truth for payment confirmation.

## Conventions & notes for contributors

- ES modules everywhere (`"type": "module"` in package.json).
- Use `express-async-handler` for async controllers and throw `ApiError` for controlled HTTP errors (`server/src/utils/*`).
- Socket room names use restaurant IDs (string). Example emit:

```js
req.io.to(restaurantId.toString()).emit('newOrder', populatedOrder.toObject());
```

- Client axios is configured with `withCredentials: true` (cookies) in `client/src/config/axios.js`.

## Useful files

- `server/index.js` — server bootstrap, Socket.io initialization, global error handler.
- `server/src/controllers/order.controller.js` — order lifecycle and socket emits.
- `server/src/controllers/payment.controller.js` — Razorpay order creation and webhook verification.
- `client/src/components/layout/Header.jsx`, `Layout.jsx` — header and layout (auth checks and toasts).

## Troubleshooting

- If uploads fail with large payloads, check server limits in `server/index.js` (JSON/urlencoded limits set to `50mb`).
- If socket events aren't reaching clients, ensure the client connects to the correct server origin and joins the right room (restaurant dashboards join their restaurant id room).
- For payment webhooks, verify the webhook secret and that the server endpoint is reachable from Razorpay (use ngrok for local testing).

## Next steps / improvements

- Add unit/integration tests for critical controllers.
- CI workflow and linting rules.
- Docker compose for local dev with MongoDB and local tunneling for webhook tests.

If you want, I can add a CONTRIBUTING.md, Docker setup, or example `.env.example` file next.
