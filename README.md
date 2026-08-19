# Cafe Billing Frontend (POS System)

Angular front end for the Cafe Billing Backend, a point-of-sale dashboard used to take orders, apply offers, and print bills across multiple café branches.

## What it does

- Login and auth flow guarded by route guards, so unauthenticated users can't reach the dashboard
- Dashboard for browsing menu items and building an order
- Applying offers and discounts at checkout
- Triggering bill and receipt printing through the backend
- Branch-aware views so staff only see their own branch's stock and orders

## Tech used

- Angular 15
- Angular Router with route guards for auth-protected pages
- REST API integration with the billing-backend service

## Project structure

- auth/ — Login and authentication
- dashboard/ — Order-taking, billing, and offers UI
- guards/ — Route guards for protected pages

## Running it locally

You'll need Node.js and the Angular CLI installed, and the billing-backend API running.

- Clone the repo and run npm install
- Run ng serve
- Open http://localhost:4200/

## Related repo

Backend API: [billing-backend](https://github.com/Vermaanjali117/billing-backend)

## Author

Anjali Verma — [GitHub](https://github.com/Vermaanjali117)
