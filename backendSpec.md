
The design assumes:

* **Credentials login**
* **No public signup**
* **One initial admin user**
* Admin can **create additional users**
* JWT session authentication for API routes

---

# CareLedger Backend `spec.md`

# Overview

Implement a **backend API in Next.js (App Router + TypeScript)** for an application called **CareLedger**.

The frontend will be built by another developer. This task only implements the **backend API**.

The backend must:

1. store clients in **DynamoDB**
2. search clients
3. determine eligibility based on `lastHelpedDate`
4. allow updating when help is given
5. calculate eligibility in backend code using a fixed **365-day** rule
6. authenticate users using **NextAuth (Auth.js)**

---

# Tech Stack

* Next.js (App Router)
* TypeScript
* DynamoDB
* NextAuth (Auth.js)
* AWS SDK v3

Routes should live in:

```
app/api/
```

Authentication should use **JWT session strategy**.

---

# Authentication

Authentication will be implemented using **NextAuth.js with Credentials Provider**.

There will be:

```
Login page
No public signup
```

Users will be stored in DynamoDB.

---

## Users Table

Partition key:

```
userId (string)
```

Attributes:

```
userId
email
passwordHash
role
createdAt
```

Example user:

```
{
  "userId": "admin",
  "email": "admin@careledger.org",
  "passwordHash": "...bcrypt hash...",
  "role": "admin",
  "createdAt": "2026-01-01"
}
```

Roles:

```
admin
staff
```

Permissions:

| Role  | Permissions            |
| ----- | ---------------------- |
| admin | manage users + clients |
| staff | manage clients only    |

---

# Initial Admin User

The system should assume **one initial admin user already exists**.

Example environment variables:

```
INITIAL_ADMIN_EMAIL
INITIAL_ADMIN_PASSWORD
```

If the Users table is empty at startup, automatically create the admin user.

---

# Authentication Flow

Users log in through:

```
/api/auth/[...nextauth]
```

NextAuth should:

1. verify credentials using bcrypt
2. issue a **JWT session**
3. include the following in the session:

```
userId
email
role
```

---

# API Route Protection

All API routes except authentication must require login.

Routes should verify the session using:

```
getServerSession()
```

If session missing:

```
401 Unauthorized
```

Admin-only routes must check:

```
session.user.role === "admin"
```

---

# User Management API

Only **admin users** may manage users.

---

## Create User

```
POST /api/users
```

Admin only.

Body:

```
{
  email
  password
  role
}
```

Password must be hashed with:

```
bcrypt
```

---

## List Users

```
GET /api/users
```

Admin only.

Return all users.

---

## Delete User

```
DELETE /api/users/{userId}
```

Admin only.

---

# Data Model

## Clients Table

Partition key:

```
clientId (string)
```

Attributes:

```
clientId
firstName
lastName
DOB
amount
purpose
lastHelpedDate
```

Date format:

```
YYYY-MM-DD
```

Multiple clients may have identical:

```
firstName
lastName
DOB
```

Uniqueness is **only** determined by `clientId`.

---




# API Routes

All responses must return JSON.

Success format:

```
{ success: true, data: ... }
```

Error format:

```
{ success: false, error: "message" }
```

---

# Create Client

```
POST /api/clients
```

Body:

```
{
  firstName
  lastName
  DOB
  amount
  purpose
  lastHelpedDate
}
```

Server generates:

```
clientId
```

Store in DynamoDB.

---

# Get Client

```
GET /api/clients/{clientId}
```

Returns client record.

---

# Update Client

```
PUT /api/clients/{clientId}
```

Allow updating:

```
firstName
lastName
DOB
amount
purpose
lastHelpedDate
```

---

# Search Clients

```
GET /api/clients/search
```

Supported queries:

### Search by clientId

```
/api/clients/search?clientId=abc123
```

### Search by lastName + DOB

```
/api/clients/search?lastName=Smith&DOB=1990-01-01
```

Rules:

* if `clientId` provided → search by ID
* otherwise require `lastName` and `DOB`
* return **all matches**

Duplicates are valid.

---

# Check Eligibility

```
GET /api/clients/{clientId}/eligibility
```

Eligibility is calculated in backend code with a hardcoded window of `365` days:

* `eligible` if days since `lastHelpedDate` is **>= 365**
* `ineligible` if days since `lastHelpedDate` is **< 365**

Return:

```
eligible
daysSinceLastHelp
daysRemaining
nextEligibleDate
```

---

# Record Help

```
POST /api/clients/{clientId}/help
```

Body:

```
{
  lastHelpedDate
  amount (optional)
  purpose (optional)
}
```

Updates the client record.

---

# Get Eligibility Config

```
GET /api/config/eligibility
```

Returns hardcoded:

```
eligibilityWindowDays = 365
```

---

# Update Eligibility Config

```
PUT /api/config/eligibility
```

Not supported because eligibility is hardcoded in backend code.

---


# Validation

Validate:

* required fields
* valid dates (`YYYY-MM-DD`)
* positive numbers

Return `400` on invalid input.

---

# Project Structure (Suggested)

```
app/api/
  auth/
  clients/
  users/

lib/
  dynamodb.ts
  auth.ts
  eligibility.ts
  validation.ts
```

---

# Implementation Goals

The backend should:

* be simple
* be readable
* avoid unnecessary abstraction
* work immediately with a frontend client
* correctly integrate DynamoDB and NextAuth authentication

Do not implement frontend pages.

