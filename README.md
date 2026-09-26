# StockSense

An inventory management application for an Odoo x GCET hackathon demonstration. Managers can manage products and warehouse records; signed-in staff can create receipts, deliveries, and transfers. Inventory changes and movement history are recorded when a ready operation is validated.

## Stack and layout

- `frontend/`: React, TypeScript, Vite, Tailwind CSS, shadcn-style UI components, Lucide, React Router, Supabase Auth.
- `backend/`: Flask REST API, bearer-token verification via Supabase Auth, business validation.
- `supabase/`: PostgreSQL schema, transactional inventory functions, Row Level Security, demo data.

The browser authenticates with Supabase and calls Flask with the access token. Flask verifies that token, checks the profile role, and calls Supabase with a **server-only** service key. PostgreSQL functions complete stock operations atomically. RLS allows authenticated read access to selected operational tables for realtime subscriptions; writes remain server-only. Dashboard and Stock subscribe to changes and also poll every eight seconds as a fallback.

## Prerequisites

Install Node.js 20.19+ or 22.12+, npm, and Python 3.10+. Create a Supabase project at [supabase.com](https://supabase.com). You need its project URL, public anon key, and service role key. Never put the service role key in `frontend/` or commit any `.env` file.

## Setup

1. In Supabase **SQL Editor**, paste and run `supabase/schema.sql`, then `supabase/seed.sql`. Run schema first. The seed script is repeatable for its named records.
2. In Supabase **Project Settings → API**, copy the project URL and keys. Copy `frontend/.env.example` to `frontend/.env`, fill in the URL and **anon** key. Copy `backend/.env.example` to `backend/.env`, fill in URL, anon key and **service role** key. The API URL stays `http://localhost:5000`.
3. In Supabase **Authentication → URL Configuration**, set the site URL to `http://localhost:5173` and allow redirect URL `http://localhost:5173/reset-password`. Email confirmation may be enabled; if so, check your inbox after signup.
4. Open two terminals in the `StockSense` folder and run the commands below.

**Terminal 1: backend (Windows PowerShell)**

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

**Terminal 1: backend (Git Bash on Windows)**

```bash
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python app.py
```

**Terminal 2: frontend**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The backend health endpoint is `http://localhost:5000/api/health`. Run commands inside the named folders, not inside a missing `backend/frontend` path.

## First manager account

All new signups start with the `staff` role to prevent anyone from granting themselves manager privileges. After signing up, use the Supabase SQL Editor as project owner to promote your own account:

```sql
update public.profiles set role = 'manager' where email = 'your-real-email@example.com';
```

Refresh the app afterward. Staff can create and validate receipts, deliveries, and transfers. Managers can also manage catalog/warehouse records and apply stock adjustments. There are no prebuilt credentials; create an account on `/signup`.

## Demo flow

1. Sign in and inspect Dashboard, Stock, and Move History. Seed data includes Office Chair stock at Main and North Warehouse.
2. Open **Receipts → New**. Select Main Warehouse and Main Stock, choose Office Chair, set expected and received to 10, then **Save draft**.
3. In receipt details, click **Confirm → Mark ready → Validate & complete**. Stock increases by 10 at Main Stock. The history gets a receipt movement.
4. Open **Deliveries → New** for the same warehouse/location and Office Chair. Set requested and delivered to 3, save, confirm, mark ready, validate. Stock decreases by 3 and history gets a delivery movement.
5. Check dashboard KPI changes. Realtime subscriptions update the view; the eight-second refresh is a fallback. Try a delivery larger than free stock: validation returns an error and leaves the document ready without changing stock.

## Routes and API

Public UI: `/login`, `/signup`, `/forgot-password`, `/reset-password`. Protected UI: `/dashboard`, `/stock`, `/products`, `/warehouses`, `/locations`, `/receipts`, `/deliveries`, `/transfers`, `/adjustments`, `/moves`, `/settings`, with `/new` and `/:id` pages for the three document types.

`GET /api/health` is public. All other calls need `Authorization: Bearer <Supabase access token>`. The API has `GET /api/dashboard`, `GET /api/me`, list/detail/create/update endpoints for products, categories, warehouses, locations, receipts, deliveries, transfers, adjustments, inventory and stock movements (writes limited by resource), `POST /api/{receipts|deliveries|transfers}/{id}/status` and `POST /api/{receipts|deliveries|transfers|adjustments}/{id}/validate`. Collection endpoints support `page`, `limit`, `search` and resource-specific exact filters. JSON errors have an `error` field.

## Rules

- A document progresses `draft → waiting → ready → done`; it can be canceled before completion. Validation requires ready status.
- A receipt adds received quantities. A delivery subtracts delivered quantities only if free stock is sufficient. A transfer subtracts and adds in one database transaction. An adjustment sets the counted stock and records the difference.
- Revalidating a done document fails. PostgreSQL locks the document and relevant inventory rows during completion. Product removal archives the record rather than deleting stock history. Foreign keys protect warehouse/location deletions where there are dependent records.

## Tests and build

```bash
cd backend
python -m unittest discover -s . -p 'test_*.py'
cd ../frontend
npm run build
```

For a live integration test, configure Supabase, start both servers, and complete the demo flow. This repository contains **no credentials** and therefore cannot sign in or run a live database transaction until connected to your project.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Missing Supabase configuration | Fill both `.env` files and restart Vite/Flask. |
| `npm` cannot find `package.json` | Run `npm install` inside `StockSense/frontend`. |
| CORS error | Set `FRONTEND_ORIGIN` in `backend/.env` to the exact Vite origin, then restart Flask. |
| Signup succeeds but login fails | Confirm the email in Supabase if email confirmation is enabled. |
| Profile missing | Re-run the profile trigger in `schema.sql`, then create a profile for a preexisting auth user. |
| Invalid service role key | Check `backend/.env` only, restart Flask, and never paste the key into browser settings. |
| Stock fails to validate | Ensure it is ready, has items, and delivery/transfer quantity does not exceed free stock in the source location. |

## Future improvements

Pagination with total counts, reservations/picking, CSV export, fine-grained role grants, audit logging, server-pushed events, and deployment automation.
