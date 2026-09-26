# StockSense design

## Goal and source

Build the supplied StockSense hackathon specification as a working React/Flask/Supabase inventory application for managers and warehouse staff. The attached text is the available source of truth. The referenced image was not supplied with this turn, so exact visual placement from it cannot be checked.

## Route map

Public: `/login`, `/signup`, `/forgot-password`, `/reset-password`. Protected: `/dashboard`, `/stock`, `/products`, `/warehouses`, `/locations`, `/receipts`, `/receipts/new`, `/receipts/:id`, `/deliveries`, `/deliveries/new`, `/deliveries/:id`, `/transfers`, `/transfers/new`, `/transfers/:id`, `/adjustments`, `/moves`, `/settings`.

## Data and security

Supabase Auth owns identities. A profile row stores full name and role. PostgreSQL tables store categories, products, warehouses, locations, inventory, receipts and items, deliveries and items, transfers and items, adjustments, and immutable stock movements. Inventory is unique per product and location; the location belongs to the warehouse. Users access the Flask API with a Supabase bearer token. Flask verifies the token with Supabase Auth and then uses its server-only service key. The public anon key is only in the browser. RLS denies anonymous table access; the backend authorizes authenticated users and manager-only mutations where applicable.

Receipt, delivery, transfer, and adjustment completion happens in database functions in one transaction. Row locks, status checks and quantity constraints prevent duplicate validation, overselling, and partial updates. Every completed line creates a movement record. Free to use equals on hand minus reserved. A transfer keeps the company total constant.

## Application architecture

React Router renders an auth screen or a protected app shell. Reusable table, form, dialog, badge, navigation, and operation components share one burgundy/neutral design system. A typed API client attaches the current access token; Supabase auth handles login/signup/reset. Data pages use server queries and invalidate/refetch on writes. Supabase realtime refreshes inventory and dashboard queries when relevant rows change. Flask exposes JSON CRUD routes, list filters and typed errors; no fake controls appear.

## Demo and verification

Seed warehouses, locations, categories, products and stock, with document examples. The critical demo is login → chair receipt +10 → stock and movement update → delivery -3 → movement and KPI update. Automated tests cover transaction rules, backend auth and route validation where possible. Frontend build, API health, and responsive route review complete local verification. An actual Supabase connection requires the user's project credentials and applying `schema.sql`/`seed.sql`.
