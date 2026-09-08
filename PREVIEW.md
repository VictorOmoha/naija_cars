# Local application preview

Open http://127.0.0.1:5173/ on this computer. If it is unavailable, run `./start-preview.ps1` from the project folder in PowerShell. The script starts the database, API and frontend in hidden windows and leaves existing services running.

This preview uses an isolated PostgreSQL database on port 5432 and the real application API on port 5056. It does not load production environment credentials. Public inventory was copied for display; account changes, messages, requests and support enquiries stay in the local database.

| Role | Email | Password |
| --- | --- | --- |
| Buyer | buyer@naijacars.test | PreviewCars2026! |
| Seller | seller@naijacars.test | PreviewCars2026! |
| Administrator | admin@naijacars.test | PreviewCars2026! |

These are local test accounts only. The seller has a test plan for checking listing creation. External email, subscription payments and cloud image storage are intentionally unconfigured locally. No actual vehicle payment is collected by a purchase/rental request. Telephone and WhatsApp links are not part of the automated preview tests.

The portable PostgreSQL runtime, database files and random database password are in the ignored `.preview` directory on this computer. They are not committed. On a fresh computer, provision a separate PostgreSQL database, install dependencies in both app directories, generate the Prisma client and apply `prisma db push`, then run the normal backend and frontend with matching local environment settings. Do not point test scripts at production.

Backend schema additions in this update are `CarListing.features` and `ContactInquiry`. The existing Render pre-deploy `prisma db push` applies them during deployment.

Run `npm run check` from the repository root for lint, automated tests and production build. To exercise the complete isolated API locally, run `node scripts/verify-preview.cjs` from `naija-cars-backend`. This creates test requests/messages/enquiries, verifies permissions and persistence, and removes its temporary listing.

See `design-qa.md` for design coverage, verification and external-service limits. The local preview is separate from the deployed application.
