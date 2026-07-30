# Setup

Run the following commands in the root directory:

```bash
npm install
```

**Development:**
```bash
npm run frontend
npm run backend
```

**Production:**
```bash
npm run build:frontend
npm run build:backend
npm run start:frontend
npm run start:backend
```

## Database

Start the local Postgres + pgAdmin containers:

```bash
docker-compose up -d
```

## Environment Variables

Create `apps/backend/.env` with the following:

```env
PORT=5000

FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=password
DB_NAME=ggi_backend

JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRATION=1d
```

---

# Modules

| Module | Responsibility |
|---|---|
| Auth | Signup, signin, JWT authentication |
| User | User creation and lookup |
| Chat | Chat history, send message |
| Subscriptions | Plans, subscriptions, quota management, renewal |

---

## Auth

Two public endpoints — no token required.

- `POST /auth/signup` — Creates a new user account. Password is hashed with bcrypt before storage. On success, the user is automatically assigned a **Free subscription** (3 messages/month).
- `POST /auth/signin` — Validates email and password, returns a signed **JWT access token** valid for 1 day.

All other endpoints are protected by a global `JwtAuthGuard`. Requests without a valid `Bearer` token in the `Authorization` header are rejected with `401 Unauthorized`. Endpoints can be opted out using the `@IsPublic()` decorator.

---

## Chat

Both endpoints require authentication. The `userId` is always read from the JWT — never sent by the client.

- `POST /chat` — Accepts a question (max 2000 chars). Deducts one message from the user's active quota before saving. The AI response is currently simulated. Returns the full chat history after saving.
- `GET /chat` — Returns the full chat history for the authenticated user, ordered oldest to newest.

---

## Subscriptions

All endpoints require authentication.

- `GET /subscriptions/bundles` — Lists all available plans (Free, Basic, Pro, Enterprise).
- `POST /subscriptions/create` — Subscribes the user to a bundle. Accepts `bundleId`, `isYearly`, and `autoRenew`. End date is always 1 month out (quota window); renewal date is 1 month or 1 year out depending on billing cycle.
- `GET /subscriptions` — Returns all subscriptions (active and inactive) for the user, with bundle details.
- `PATCH /subscriptions/:id` — Toggles the `autoRenew` flag on a subscription.

**Renewal Script** — `npm run renew-subscriptions`

A standalone CLI script to process all active subscriptions:

- `autoRenew = true` → rolls the subscription forward (new start/end/renewal dates, quota reset to 0).
- `autoRenew = false` → if the subscription period has expired, marks it `isActive = false`.

---

## Assumptions

1. Quota consumption uses the Free plan first, then falls back to the most recent active paid subscription.
2. Cancellation is handled by disabling `autoRenew`. The user keeps access and quota until the period expires, at which point the renewal script deactivates the subscription.
3. For yearly plans, the renewal cycle is yearly but quota refreshes monthly.
4. A Free plan is seeded automatically. Its end date is always the 1st of the next month, giving users a fresh 3-message quota every month as required by the assessment.

---

> PS: I had very limited time to scaffold this project and implemented a minimal but functional version.

## Improvements that can be made

1. **Refresh Tokens** — Currently only a short-lived access token is issued. A refresh token flow would allow users to stay logged in without re-authenticating.
2. **Scheduled Renewal** — The renewal script is currently run manually. It should be scheduled as a cron job (e.g., daily at midnight) using NestJS `@nestjs/schedule` or an external scheduler. When integrating with Stripe, this would be handled via webhooks.
3. **Billing History** — Subscription renewals and quota consumption events are not recorded. A `billing_events` or `transactions` table would give users a full history.
4. **Validation & Error Handling** — DTOs have basic validation but error responses could be more structured and consistent (e.g., a global exception filter with a standard error shape).
5. **Pagination** — Chat history and subscription lists are returned in full with no pagination, which will not scale.
6. **Quota on Yearly Plans** — Yearly plan quota currently resets only on script run. A more robust design would track the quota window start date independently so it resets monthly regardless of the renewal cycle.
7. **Frontend Auth Guard** — There is no client-side route guard. If the access token is missing or expired, the user should be redirected to `/signin` automatically rather than seeing a raw API error.