# Banking Management System

A Node.js and MongoDB REST API for a ledger-based banking workflow. The project supports user authentication, account management, balance calculation from immutable ledger entries, money transfers, system-user initial funding, token revocation, and email notifications.

> **Project status:** Learning project / backend API. It is not intended for production financial use without the hardening items listed in [Known limitations](#known-limitations-and-next-steps).

## Highlights

- JWT authentication using an HTTP cookie or `Authorization: Bearer <token>` header
- Password hashing with bcrypt
- Logout token revocation backed by MongoDB TTL records
- One account per registered user
- Ledger-derived balances: `credits - debits`
- Immutable debit and credit ledger entries for every completed transfer
- Idempotency keys on transactions to prevent duplicate processing
- MongoDB transactions for atomic transfer persistence
- System-user-only initial funding endpoint
- Registration and successful-transfer notifications through Gmail OAuth2

## Architecture

```text
Client
  │
  ▼
Express routes → Authentication middleware → Controllers
                                             │
                                             ├── Users / Accounts / Transactions
                                             ├── Immutable ledger entries
                                             ├── MongoDB session transaction
                                             └── Email notification service
```

## Technology

| Area | Tools |
| --- | --- |
| Runtime | Node.js |
| HTTP API | Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens, bcryptjs, cookie-parser |
| Email | Nodemailer with Gmail OAuth2 |
| Configuration | dotenv |

## Data model

- **User** — email, name, hashed password, and an internal `systemUser` flag.
- **Account** — linked to one user; includes status and currency.
- **Transaction** — source account, destination account, amount, unique idempotency key, status, and timestamps.
- **Ledger** — immutable `DEBIT` or `CREDIT` entry linked to an account and transaction.
- **Token blacklist** — invalidates logged-out tokens and expires after three days.

An account balance is not stored as a mutable column. It is computed from ledger entries:

```text
balance = total CREDIT amounts - total DEBIT amounts
```

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB configured as a replica set (required for MongoDB transactions)
- A Gmail OAuth2 configuration if email notifications are enabled

### Install and run

```bash
git clone https://github.com/Gopi-9279/Banking_Management_System.git
cd Banking_Management_System
npm install
npm run dev
```

The API runs on `http://localhost:3000`.

### Environment variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/Banking_System?replicaSet=rs0
JWT_SECRET=replace-with-a-long-random-secret

EMAIL_USER=your-gmail-address@gmail.com
CLIENT_ID=google-oauth-client-id
CLIENT_SECRET=google-oauth-client-secret
REFRESH_TOKEN=google-oauth-refresh-token
```

Never commit `.env` or OAuth credentials.

## API reference

Protected endpoints require either the `token` cookie returned by login/register or:

```http
Authorization: Bearer <jwt>
```

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a user and return a JWT |
| POST | `/api/auth/login` | Authenticate a user and return a JWT |
| POST | `/api/auth/logout` | Clear the cookie and blacklist the active JWT |

**Register**

```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "secure-password"
}
```

### Accounts

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/accounts` | Create an account for the authenticated user |
| GET | `/api/accounts` | List the authenticated user's accounts |
| GET | `/api/accounts/balance/:accountId` | Get the authenticated owner's ledger-derived balance |

The application currently allows one account per user.

### Transfers

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/transactions` | Transfer funds between active accounts |
| POST | `/api/transactions/system/initial-funds` | Fund an account using a system user's account |

**Transfer request**

```json
{
  "fromAccount": "source-account-object-id",
  "toAccount": "destination-account-object-id",
  "amount": 1000,
  "idempotencyKey": "unique-client-generated-key"
}
```

A completed transfer creates:

1. a transaction record;
2. a `DEBIT` ledger entry for `fromAccount`; and
3. a `CREDIT` ledger entry for `toAccount`.

The transfer controller rejects inactive accounts and checks that the source balance covers the requested amount before starting its database transaction.

**Initial funding request**

```json
{
  "toAccount": "destination-account-object-id",
  "amount": 1000,
  "idempotencyKey": "unique-client-generated-key"
}
```

This route requires a user whose database record has `systemUser: true`. It finds an account owned by that system user, debits it, and credits the destination account.

## Typical workflow

1. Register and save the returned JWT.
2. Create an account with `POST /api/accounts`.
3. Retrieve account IDs through `GET /api/accounts`.
4. Fund an account through the system-user endpoint.
5. Use `POST /api/transactions` for transfers.
6. Read current balance from `GET /api/accounts/balance/:accountId`.

## Known limitations and next steps

The following improvements are needed before production use:

- **Account ownership:** Normal transfers currently verify that both account IDs exist, but must also verify that `fromAccount` belongs to the authenticated user.
- **Dedicated bank account:** Initial funding currently selects the first account owned by the system user. Add an `isSystemAccount` field and enforce exactly one system funding account.
- **Source funding policy:** Initial funding currently debits the system account without checking its balance. Define whether the bank account must be pre-funded or whether deposits should be modeled as minting.
- **Concurrent transfer protection:** A balance check before the transaction can be raced by parallel requests. Use a reservation/conditional update strategy or a serializable design.
- **Remove test delay:** The normal-transfer controller contains a 10-second delay inside an open MongoDB transaction. Remove it outside of concurrency experiments.
- **Error handling:** Add a central Express error handler, abort sessions on failures, and return safe structured error responses.
- **Validation and tests:** Add request validation, positive-integer/currency-safe amount handling, API tests, and integration tests against a MongoDB replica set.
- **Operational security:** Configure secure cookies, CORS, rate limits, audit logging, secret rotation, monitoring, and a production email queue.

## License

This project currently has no explicit license. Add a license file before distributing or accepting external contributions.
