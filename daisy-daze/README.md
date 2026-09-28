# Daisy Daze

A full-width React flower and gifting storefront for Indian customers, with INR pricing, bouquets, mogra gajras, marigold torans, plush friends, and mithai hampers. Includes an Express API, MongoDB persistence, JWT authentication, and admin order/product tools.

## Where things live

- `src/App.jsx` joins the storefront sections and owns the shared shopping state.
- `src/components/` contains the header, hero, product cards, cart, account, and admin views.
- `src/data/products.js` is the browser demo catalog; `src/lib/` contains API/storage and INR helpers.
- `src/style.css` holds the site-wide theme, layout, responsive rules, and overlay styling.
- `server/index.js` starts Express and MongoDB; `server/routes/`, `server/models/`, and `server/middleware/` contain API endpoints, database shapes, and access checks.
- `index.html` loads the React root; `public/favicon.svg` is the shop icon.
- `package.json`, `package-lock.json`, and `.gitignore` are configuration formats that do not support inline comments. Their purpose is summarized here and in the setup sections below.

## Run the storefront

```sh
npm install
npm run dev
```

The India-focused catalog, cart, favorites, and guest checkout work in the browser without a database. Local browser storage is used for this demo mode. Checkout collects an Indian mobile number and delivery PIN code.

## Run the API

Install and start MongoDB locally, copy `.env.example` to `.env`, then set a private `JWT_SECRET` and the admin account credentials. Start the API in a second terminal:

```sh
npm run server
```

The API listens on `http://localhost:4000`. It creates or updates the sample catalog and provisions the admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Prices and order totals are in Indian rupees. Keep `.env` private. To use a different Vite port, set `CLIENT_URL` to that origin.

## API routes

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/products`; admin-only `POST`, `PUT /:id`, and `DELETE /:id`
- Signed-in customer `POST /api/orders` and `GET /api/orders/mine`
- Admin `GET /api/orders` and `PATCH /api/orders/:id` to update status
- `GET /api/health`

Order totals are calculated from product prices in MongoDB. Checkout records orders; connect a payment provider before accepting real payments.