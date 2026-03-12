# COM-PAJAmAs
System for the Community Outreach Ministry to help the community.

## Backend API Setup

This project includes a Next.js App Router backend under `app/api` for CareLedger.

### Required Environment Variables

Create a `.env.local` file:

```bash
AWS_REGION=us-east-1
CLIENTS_TABLE_NAME=CareLedgerClients
USERS_TABLE_NAME=CareLedgerUsers
AUTH_SECRET=replace-with-long-random-secret
INITIAL_ADMIN_EMAIL=admin@careledger.org
INITIAL_ADMIN_PASSWORD=replace-with-strong-password
```

### AWS Prerequisites

1. DynamoDB table for clients with partition key `clientId` (string)
2. DynamoDB table for users with partition key `userId` (string)
3. GSI on clients table:
   - Name: `lastName-DOB-index`
   - Partition key: `lastName`
   - Sort key: `DOB`

### Authentication Notes

1. Auth uses NextAuth (Auth.js) credentials provider at `/api/auth/[...nextauth]`.
2. API routes use session cookies (no Bearer header flow).
3. No public signup flow.
4. On first authentication attempt, if `USERS_TABLE_NAME` is empty, the app auto-seeds the initial admin from `INITIAL_ADMIN_*` env vars.
5. Admin-only routes:
   - `GET/POST /api/users`
   - `DELETE /api/users/{userId}`
   - `GET/PUT /api/config/eligibility`
6. Eligibility window is hardcoded to `365` days.

### API Response Format

1. Success:
   - `{ "success": true, "data": ... }`
2. Error:
   - `{ "success": false, "error": "message" }`
3. `PUT /api/config/eligibility` returns `405` because eligibility is hardcoded.

### Scripts

```bash
npm run dev
npm run lint
npm test
```
