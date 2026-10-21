# Ma'Great Taste Admin Studio

A separate responsive React + TypeScript + Vite admin dashboard prototype for the Ma'Great Taste food, meal-prep and catering platform. It is designed to deploy as a separate Render Static Site.

## Included dashboard areas
- Overview with illustrative revenue chart, category mix, recent orders and attention list
- Orders with searchable table, demo status updates and CSV export
- Menu management with category filters, add-item modal, price/category and availability interactions
- Catering and event enquiry board
- Weekly, family and monthly freezer meal plan cards
- Customer messages inbox with unread indicators
- Blog article list and create-draft modal
- Analytics, top-selling demo menu items and CSV order export
- Customer list and business settings preview

## Run locally
Requires Node.js 20+.

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy as a separate Render Static Site
1. Push this folder to its own Git repository (or set the Render root directory to `magreattaste-admin` in a monorepo).
2. In Render, create a **Static Site**.
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Deploy.

## Important: prototype, not production admin
All figures, customers, orders, messages, blog posts and food items are sample data. Interactions are currently local/demo only. No authentication, roles, database/API integration, real uploads, customer communications, or persisted changes are included yet. Do not expose this demo as a real admin console until secure authentication and server-side authorization are implemented. Next step is to connect it to the Node/Express API and PostgreSQL backend, and protect all admin endpoints with sessions/JWT, role checks, input validation, and audit logs.
