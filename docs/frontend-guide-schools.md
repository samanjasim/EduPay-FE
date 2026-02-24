# EduPay — Frontend Developer Guide: School Module

> **API Base URL**: `http://localhost:5000/api/v1`
> **Swagger UI**: `http://localhost:5000/swagger`
> **Version**: 1.0

---

## Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [Authorization Model](#2-authorization-model)
3. [Request Conventions](#3-request-conventions)
4. [Response Envelope](#4-response-envelope)
5. [Auth Endpoints](#5-auth-endpoints)
6. [School Endpoints](#6-school-endpoints)
7. [User & Role Endpoints](#7-user--role-endpoints)
8. [Per-Role Behavior Matrix](#8-per-role-behavior-matrix)
9. [Seed Test Accounts](#9-seed-test-accounts)
10. [Error Handling](#10-error-handling)

---

## 1. Authentication Flow

### Login → Get Token → Use Token

```
POST /api/v1/auth/login
Body: { "email": "...", "password": "..." }
Response: { accessToken, refreshToken, expiresAt, user }
```

Store the `accessToken` and attach it to every subsequent request:

```
Authorization: Bearer <accessToken>
```

### Token Refresh

When the access token expires (check `expiresAt`), call:

```
POST /api/v1/auth/refresh-token
Body: { "refreshToken": "..." }
Response: { accessToken, refreshToken, expiresAt, user }  (new tokens)
```

### School Context Header

For school-scoped operations in the admin portal, send the active school ID as a header:

```
X-School-Id: <GUID>
```

The server validates that the logged-in user has access to this school. If they don't, it is ignored. SuperAdmin/Admin users can pass any school ID. SchoolAdmin users can only pass their assigned school(s).

---

## 2. Authorization Model

### Roles

| Role | Description |
|------|-------------|
| `SuperAdmin` | Full platform access — all schools, all actions |
| `Admin` | Platform-level admin — most actions across all schools |
| `SchoolAdmin` | Manages a specific school — students, fees, events |
| `Parent` | Views children's fees and makes payments |
| `Student` | Views own fees and wallet |

### Permissions (Policy-Based)

Each API endpoint requires a specific permission. The backend checks if the user's role(s) grant that permission. The frontend should use the user's roles (from the login response) to show/hide UI elements.

**Schools Module Permissions:**

| Permission | SuperAdmin | Admin | SchoolAdmin | Parent | Student |
|-----------|:---:|:---:|:---:|:---:|:---:|
| `Schools.View` | yes | yes | yes (own school only) | — | — |
| `Schools.Create` | yes | yes | — | — | — |
| `Schools.Update` | yes | yes | — | — | — |
| `Schools.Delete` | yes | — | — | — | — |
| `Schools.ManageSettings` | yes | — | yes (own school only) | — | — |
| `Schools.ManageAdmins` | yes | yes | — | — | — |

> **Important: Tenant Scoping** — SchoolAdmin has `Schools.View` and `Schools.ManageSettings`, but the API enforces **tenant-level access**: they can only view/manage their own assigned school(s). Attempting to access another school returns `403 Forbidden`.

### JWT Claims

The login response's `accessToken` (JWT) contains:
- `accessible_schools` — comma-separated school GUIDs the user can access
- Platform admins have this claim empty (meaning "all schools")
- SchoolAdmin has their assigned school ID(s)

You don't need to decode the JWT — use the user roles from the login response to determine what to show.

---

## 3. Request Conventions

### Headers (every request)

```
Authorization: Bearer <accessToken>
Content-Type: application/json
X-School-Id: <GUID>              (optional — for school-scoped admin operations)
X-Api-Version: 1.0               (optional — default is 1.0)
```

### CORS

The API allows requests from `http://localhost:3000` and `http://localhost:5173`. Credentials (`withCredentials`) are supported.

### Pagination Query Parameters

All list endpoints support pagination. Common parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pageNumber` | int | 1 | Page number (1-based) |
| `pageSize` | int | 10 | Items per page |
| `searchTerm` | string | — | Free-text search |
| `sortBy` | string | — | Sort field name |
| `sortDescending` | bool | false | Sort direction |

Some endpoints have additional filters — see each endpoint's section for details.

---

## 4. Response Envelope

### Success Response

```json
{
  "success": true,
  "message": null,
  "errors": null,
  "validationErrors": null,
  "data": { ... }
}
```

### Paginated Response

All list endpoints use the same envelope — `data` holds the array, `pagination` holds the metadata:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 100,
    "totalPages": 10,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "School.NotFound",
  "errors": null,
  "validationErrors": null,
  "data": null
}
```

### Validation Error Response (400)

```json
{
  "success": false,
  "message": null,
  "validationErrors": {
    "name": ["'Name' must not be empty."],
    "code": ["'Code' must not exceed 20 characters."]
  },
  "data": null
}
```

---

## 5. Auth Endpoints

### 5.1 Login

```
POST /api/v1/auth/login
```

**Request:**
```json
{
  "email": "superadmin@edupay.com",
  "password": "Admin@123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "dGhpcyBpcyBh...",
    "expiresAt": "2026-02-20T14:00:00Z",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "username": "superadmin",
      "email": "superadmin@edupay.com",
      "firstName": "Super",
      "lastName": "Admin",
      "phoneNumber": null,
      "status": "Active",
      "emailConfirmed": true,
      "phoneConfirmed": false,
      "lastLoginAt": "2026-02-20T12:00:00Z",
      "createdAt": "2026-02-01T00:00:00Z",
      "roles": ["SuperAdmin"]
    }
  }
}
```

**Errors:** `401` — Invalid credentials

### 5.2 Register

```
POST /api/v1/auth/register
```

**Request:**
```json
{
  "username": "john_parent",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "Parent@123456",
  "confirmPassword": "Parent@123456"
}
```

**Password Rules:** min 8 chars, uppercase, lowercase, digit, special character.

**Response (200):** `{ "success": true, "data": "<new-user-guid>" }`

**Errors:** `409` — Email/username already exists

### 5.3 Refresh Token

```
POST /api/v1/auth/refresh-token
```

**Request:**
```json
{
  "refreshToken": "dGhpcyBpcyBh..."
}
```

**Response:** Same as Login response (new tokens + user data).

### 5.4 Change Password

```
POST /api/v1/auth/change-password
Authorization: Bearer <token>
```

**Request:**
```json
{
  "currentPassword": "Admin@123456",
  "newPassword": "NewPass@789",
  "confirmNewPassword": "NewPass@789"
}
```

### 5.5 Get Current User

```
GET /api/v1/auth/me
Authorization: Bearer <token>
```

**Response:** Returns `UserDto` (same shape as `user` object in login response).

---

## 6. School Endpoints

### 6.1 List Schools (Paginated)

```
GET /api/v1/schools?pageNumber=1&pageSize=10&searchTerm=baghdad&status=Active&sortBy=name
Authorization: Bearer <token>
Policy: Schools.View
```

**Query Parameters:**
| Param | Type | Notes |
|-------|------|-------|
| `pageNumber` | int | Default: 1 |
| `pageSize` | int | Default: 10 |
| `searchTerm` | string? | Searches name, code, city (case-insensitive) |
| `city` | string? | Exact city filter |
| `status` | string? | `Pending`, `Active`, `Suspended`, `Deactivated` |
| `sortBy` | string? | `name`, `code`, `city`, `createdat` |
| `sortDescending` | bool | Default: false |

**Tenant Scoping:**
- **SuperAdmin/Admin** — sees all schools across the platform
- **SchoolAdmin** — sees only their assigned school(s)
- **Deactivated schools** are excluded by default. Pass `status=Deactivated` to see them explicitly.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Baghdad International School",
      "code": "SCH-BGD-001",
      "city": "Baghdad",
      "logoUrl": null,
      "status": "Active",
      "subscriptionPlan": "Premium",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 3,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

### 6.2 Get School By ID

```
GET /api/v1/schools/{id}
Authorization: Bearer <token>
Policy: Schools.View
```

**Tenant Scoping:** SchoolAdmin users can only access schools they are assigned to. Attempting to fetch another school's ID returns `403 Forbidden`.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Baghdad International School",
    "code": "SCH-BGD-001",
    "address": "Al-Mansour, Baghdad",
    "city": "Baghdad",
    "phone": "+964-770-123-4567",
    "contactEmail": "info@baghdad-school.edu.iq",
    "logoUrl": null,
    "status": "Active",
    "subscriptionPlan": "Premium",
    "currentAcademicYear": {
      "startYear": 2025,
      "endYear": 2026,
      "label": "2025-2026"
    },
    "settings": {
      "currency": "IQD",
      "timezone": "Asia/Baghdad",
      "defaultLanguage": "ar",
      "allowPartialPayments": true,
      "allowInstallments": true,
      "maxInstallments": 12,
      "lateFeePercentage": 0.0
    },
    "admins": [
      {
        "userId": "...",
        "fullName": "Ahmed School Admin",
        "email": "ahmed@baghdad-school.edu.iq",
        "isPrimary": true,
        "assignedAt": "2026-01-15T10:00:00Z"
      }
    ],
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

### 6.3 Get My School

```
GET /api/v1/schools/my-school
Authorization: Bearer <token>
Policy: Schools.View
```

Returns the school details for the current user's active school. Resolution order:
1. `X-School-Id` header (if present and user has access)
2. First school from the user's `accessible_schools` JWT claim

Useful for the SchoolAdmin dashboard landing page.

**Response:** Same shape as Get School By ID.

**Error:** `404` if user has no active school.

### 6.4 Create School

```
POST /api/v1/schools
Authorization: Bearer <token>
Policy: Schools.Create
```

**Request:**
```json
{
  "name": "Baghdad International School",
  "code": "SCH-BGD-001",
  "city": "Baghdad",
  "subscriptionPlan": "Premium",
  "academicYearStart": 2025,
  "academicYearEnd": 2026,
  "address": "Al-Mansour, Baghdad",
  "phone": "+964-770-123-4567",
  "contactEmail": "info@baghdad-school.edu.iq",
  "logoUrl": null
}
```

**Validation Rules:**
| Field | Required | Max Length | Notes |
|-------|:--------:|:---------:|-------|
| `name` | yes | 200 | Must be unique |
| `code` | yes | 20 | Must be unique, cannot be changed later |
| `city` | yes | 100 | |
| `subscriptionPlan` | yes | — | `Basic`, `Standard`, or `Premium` |
| `academicYearStart` | yes | — | Integer year |
| `academicYearEnd` | yes | — | Must be `academicYearStart + 1` |
| `address` | no | 500 | |
| `phone` | no | — | |
| `contactEmail` | no | — | Must be valid email format |
| `logoUrl` | no | 500 | |

**Response (201):**
```json
{
  "success": true,
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

`Location` header: `/api/v1/schools/{new-id}`

**Errors:**
- `409` — `School.CodeAlreadyExists` or `School.NameAlreadyExists`

### 6.5 Update School

```
PUT /api/v1/schools/{id}
Authorization: Bearer <token>
Policy: Schools.Update
```

**Request:**
```json
{
  "name": "Baghdad International School (Updated)",
  "city": "Baghdad",
  "address": "New Address, Baghdad",
  "phone": "+964-770-999-8888",
  "contactEmail": "new@baghdad-school.edu.iq",
  "logoUrl": null
}
```

> **Note:** `code` and `subscriptionPlan` are NOT updatable here.

### 6.6 Update School Status

```
PATCH /api/v1/schools/{id}/status
Authorization: Bearer <token>
Policy: Schools.Update
```

**Request:**
```json
{
  "status": "Active"
}
```

**Valid status values:** `Active`, `Suspended`, `Deactivated`

> `Pending` is the initial status set on creation — you cannot set it back to `Pending`.

**Errors:**
- `School.InvalidStatus` — Unknown status string
- `School.InvalidStatusTransition` — Invalid transition

### 6.7 Update School Settings

```
PUT /api/v1/schools/{id}/settings
Authorization: Bearer <token>
Policy: Schools.ManageSettings
```

**Request:**
```json
{
  "currency": "IQD",
  "timezone": "Asia/Baghdad",
  "defaultLanguage": "ar",
  "allowPartialPayments": true,
  "allowInstallments": true,
  "maxInstallments": 12,
  "lateFeePercentage": 2.5
}
```

**Constraints:**
- `maxInstallments`: 1–24
- `lateFeePercentage`: >= 0

### 6.8 Assign Admin to School

```
POST /api/v1/schools/{id}/admins
Authorization: Bearer <token>
Policy: Schools.ManageAdmins
```

**Request:**
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "isPrimary": true
}
```

The user must already exist and have the `SchoolAdmin` role assigned separately (via the Roles API).

**Errors:** `409` — `School.AdminAlreadyAssigned`

### 6.9 Remove Admin from School

```
DELETE /api/v1/schools/{id}/admins/{userId}
Authorization: Bearer <token>
Policy: Schools.ManageAdmins
```

**Errors:** `404` — `School.AdminNotFound`

### 6.10 Delete School

```
DELETE /api/v1/schools/{id}
Authorization: Bearer <token>
Policy: Schools.Delete
```

---

## 7. User & Role Endpoints

### 7.1 Users

| Method | Route | Policy | Description |
|--------|-------|--------|-------------|
| GET | `/api/v1/users` | `Users.View` | List users (paginated) |
| GET | `/api/v1/users/{id}` | `Users.View` | Get user by ID |

#### List Users (Paginated)

```
GET /api/v1/users?pageNumber=1&pageSize=10&searchTerm=ahmed&status=Active&role=SchoolAdmin&sortBy=username
Authorization: Bearer <token>
Policy: Users.View
```

**Query Parameters:**
| Param | Type | Notes |
|-------|------|-------|
| `pageNumber` | int | Default: 1 |
| `pageSize` | int | Default: 10 |
| `searchTerm` | string? | Searches username, email, first name, last name (case-insensitive) |
| `status` | string? | `Pending`, `Active`, `Suspended`, `Deactivated`, `Locked` |
| `role` | string? | Filter by role name (e.g. `SchoolAdmin`, `Parent`) |
| `sortBy` | string? | `username`, `email`, `firstname` |
| `sortDescending` | bool | Default: false (default sort: newest first by `createdAt`) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "username": "ahmed_schooladmin",
      "email": "ahmed.admin@edupay.com",
      "firstName": "Ahmed",
      "lastName": "Al-Rashid",
      "phoneNumber": null,
      "status": "Active",
      "emailConfirmed": true,
      "phoneConfirmed": false,
      "lastLoginAt": "2026-02-20T12:00:00Z",
      "createdAt": "2026-02-19T23:24:22Z",
      "roles": ["SchoolAdmin"]
    }
  ],
  "pagination": {
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 6,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

#### Get User By ID

```
GET /api/v1/users/{id}
```

**Response:** Single `UserDto` wrapped in `{ "success": true, "data": { ... } }`

### 7.2 Roles

| Method | Route | Policy | Description |
|--------|-------|--------|-------------|
| GET | `/api/v1/roles` | `Roles.View` | List roles (paginated) |
| GET | `/api/v1/roles/{id}` | `Roles.View` | Get role by ID |
| POST | `/api/v1/roles` | `Roles.Create` | Create role |
| PUT | `/api/v1/roles/{id}` | `Roles.Update` | Update role |
| DELETE | `/api/v1/roles/{id}` | `Roles.Delete` | Delete role |
| PUT | `/api/v1/roles/{id}/permissions` | `Roles.ManagePermissions` | Replace role permissions |
| POST | `/api/v1/roles/{id}/users/{userId}` | `Users.ManageRoles` | Assign role to user |
| DELETE | `/api/v1/roles/{id}/users/{userId}` | `Users.ManageRoles` | Remove role from user |

#### List Roles (Paginated)

```
GET /api/v1/roles?pageNumber=1&pageSize=10&searchTerm=admin&sortBy=name
Authorization: Bearer <token>
Policy: Roles.View
```

**Query Parameters:**
| Param | Type | Notes |
|-------|------|-------|
| `pageNumber` | int | Default: 1 |
| `pageSize` | int | Default: 10 |
| `searchTerm` | string? | Searches name and description (case-insensitive) |
| `sortBy` | string? | `name`, `createdat` |
| `sortDescending` | bool | Default: false (default sort: alphabetical by name) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "SchoolAdmin",
      "description": "SchoolAdmin system role",
      "isSystemRole": true,
      "isActive": true,
      "createdAt": "2026-02-19T13:53:31Z",
      "permissions": [
        { "id": "...", "name": "Schools.View", "description": "...", "module": "Schools", "isActive": true },
        { "id": "...", "name": "Schools.ManageSettings", "description": "...", "module": "Schools", "isActive": true }
      ]
    }
  ],
  "pagination": {
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 5,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}

### 7.3 Permissions

| Method | Route | Policy | Description |
|--------|-------|--------|-------------|
| GET | `/api/v1/permissions` | `Roles.View` | List all permissions grouped by module |

**Response:**
```json
{
  "data": [
    {
      "module": "Schools",
      "permissions": [
        { "id": "...", "name": "Schools.View", "description": "...", "module": "Schools", "isActive": true },
        { "id": "...", "name": "Schools.Create", "description": "...", "module": "Schools", "isActive": true }
      ]
    },
    {
      "module": "Users",
      "permissions": [ ... ]
    }
  ]
}
```

---

## 8. Per-Role Behavior Matrix

### What Each Role Can Do in the School Module

| Action | SuperAdmin | Admin | SchoolAdmin |
|--------|:---:|:---:|:---:|
| List all schools | yes (all) | yes (all) | yes (own only) |
| View any school by ID | yes | yes | own only (403 for others) |
| View "my school" | yes | yes | yes |
| Create school | yes | yes | — |
| Update school info | yes | yes | — |
| Update school status | yes | yes | — |
| Update school settings | yes | — | yes (own only) |
| Assign admin to school | yes | yes | — |
| Remove admin from school | yes | yes | — |
| Delete school | yes | — | — |
| List users | yes | yes | — |
| Manage roles | yes | — | — |

### Typical Frontend Flows by Role

**SuperAdmin / Admin (Web Admin Portal):**
1. Login → see dashboard with all schools
2. Click "Schools" → paginated list with search/filter
3. Click "Create School" → form with name, code, city, plan, academic year
4. Click a school → details page with tabs: Info, Settings, Admins
5. On Info tab → edit name, address, city, phone, email, logo
6. On Settings tab → manage currency, timezone, payments config
7. On Admins tab → assign/remove school admins
8. Change school status (Activate, Suspend, Deactivate)

**SchoolAdmin (Web Admin Portal):**
1. Login → lands on "My School" dashboard
2. Call `GET /api/v1/schools/my-school` (or with `X-School-Id` header if admin of multiple schools)
3. See school info and settings
4. On Settings tab → manage currency, timezone, payment config (`PUT /api/v1/schools/{id}/settings`)
5. School info fields (name, address, etc.) and status are **read-only** for SchoolAdmin — only SuperAdmin/Admin can update those
6. Future: manage students, fees, events within their school

**Parent / Student (Mobile App — future):**
- No access to School endpoints at all
- They interact with student/fee/payment endpoints (Block 2+)

---

## 9. Seed Test Accounts

The following accounts are seeded automatically when the API starts. Use them for testing:

| Role | Email | Password | Username |
|------|-------|----------|----------|
| SuperAdmin | `superadmin@edupay.com` | `Admin@123456` | `superadmin` |
| Admin | `admin@edupay.com` | `Admin@123456` | `admin` |
| SchoolAdmin (Baghdad School) | `ahmed.admin@edupay.com` | `Admin@123456` | `ahmed_schooladmin` |
| SchoolAdmin (Erbil School) | `kara.admin@edupay.com` | `Admin@123456` | `kara_schooladmin` |
| Parent | `parent@edupay.com` | `Parent@123456` | `omar_parent` |
| Student | `student@edupay.com` | `Student@123456` | `ali_student` |

### Seeded Schools

| School Name | Code | City | Plan | Status |
|-------------|------|------|------|--------|
| Baghdad International School | SCH-BGD-001 | Baghdad | Premium | Active |
| Erbil Academy | SCH-EBL-001 | Erbil | Standard | Active |
| Basra Modern School | SCH-BSR-001 | Basra | Basic | Pending |

### Admin Assignments

- `ahmed.admin@edupay.com` is the **primary** admin of Baghdad International School
- `kara.admin@edupay.com` is the **primary** admin of Erbil Academy
- Basra Modern School has no admin assigned yet

### Testing Workflow

1. **Login as SuperAdmin** → you can see all 3 schools, create new ones, manage admins
2. **Login as Admin** → you can see all schools, create/update schools, assign admins (but can't delete or manage settings)
3. **Login as SchoolAdmin (ahmed)** → call `GET /api/v1/schools/my-school` with header `X-School-Id: <baghdad-school-id>` to see the Baghdad school
4. **Login as Parent/Student** → no access to school endpoints (403 Forbidden)

---

## 10. Error Handling

### HTTP Status Codes

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| 200 | Success | Display data |
| 201 | Created | Show success, redirect to detail page |
| 400 | Validation error | Show field-level errors from `validationErrors` |
| 401 | Unauthorized | Redirect to login, try token refresh |
| 403 | Forbidden | Show "Access Denied" message |
| 404 | Not Found | Show "Not Found" page |
| 409 | Conflict | Show specific error (e.g. "Code already exists") |
| 429 | Rate Limited | Show "Too many requests, try again later" |
| 500 | Server Error | Show generic error message |

### School-Specific Error Codes

| Error Code | HTTP | Meaning |
|-----------|------|---------|
| `Error.Forbidden` | 403 | User does not have access to this school (tenant scoping) |
| `School.NotFound` | 404 | School ID doesn't exist |
| `School.NotFoundForUser` | 404 | User is not assigned to any school (on `my-school`) |
| `School.CodeAlreadyExists` | 409 | Duplicate school code |
| `School.NameAlreadyExists` | 409 | Duplicate school name |
| `School.AdminAlreadyAssigned` | 409 | User is already an admin of this school |
| `School.AdminNotFound` | 404 | Admin user not found in this school |
| `School.NotActive` | 400 | School must be active for this action |
| `School.InvalidStatus` | 400 | Unknown status string |
| `School.InvalidStatusTransition` | 400 | Cannot transition to that status |

### Token Expiration

The response header `Token-Expired: true` is set when the JWT has expired. Use this to trigger a refresh:

```javascript
// Axios interceptor example
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const tokenExpired = error.response.headers['token-expired'];
      if (tokenExpired === 'true') {
        // Try refresh
        const newTokens = await refreshToken();
        // Retry original request with new token
        error.config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return axios(error.config);
      }
      // Token is invalid, redirect to login
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);
```

---

## Quick Reference: All Endpoints

| # | Method | Route | Auth | Description |
|---|--------|-------|------|-------------|
| 1 | POST | `/api/v1/auth/login` | Public | Login |
| 2 | POST | `/api/v1/auth/register` | Public | Register |
| 3 | POST | `/api/v1/auth/refresh-token` | Public | Refresh JWT |
| 4 | POST | `/api/v1/auth/change-password` | Authenticated | Change password |
| 5 | GET | `/api/v1/auth/me` | Authenticated | Current user |
| 6 | GET | `/api/v1/schools` | Schools.View | List schools |
| 7 | GET | `/api/v1/schools/{id}` | Schools.View | Get school |
| 8 | GET | `/api/v1/schools/my-school` | Schools.View | My school |
| 9 | POST | `/api/v1/schools` | Schools.Create | Create school |
| 10 | PUT | `/api/v1/schools/{id}` | Schools.Update | Update school |
| 11 | PATCH | `/api/v1/schools/{id}/status` | Schools.Update | Change status |
| 12 | PUT | `/api/v1/schools/{id}/settings` | Schools.ManageSettings | Update settings |
| 13 | POST | `/api/v1/schools/{id}/admins` | Schools.ManageAdmins | Assign admin |
| 14 | DELETE | `/api/v1/schools/{id}/admins/{userId}` | Schools.ManageAdmins | Remove admin |
| 15 | DELETE | `/api/v1/schools/{id}` | Schools.Delete | Delete school |
| 16 | GET | `/api/v1/users` | Users.View | List users (paginated) |
| 17 | GET | `/api/v1/users/{id}` | Users.View | Get user |
| 18 | GET | `/api/v1/roles` | Roles.View | List roles (paginated) |
| 19 | GET | `/api/v1/roles/{id}` | Roles.View | Get role |
| 20 | POST | `/api/v1/roles` | Roles.Create | Create role |
| 21 | PUT | `/api/v1/roles/{id}` | Roles.Update | Update role |
| 22 | DELETE | `/api/v1/roles/{id}` | Roles.Delete | Delete role |
| 23 | PUT | `/api/v1/roles/{id}/permissions` | Roles.ManagePermissions | Set permissions |
| 24 | POST | `/api/v1/roles/{id}/users/{userId}` | Users.ManageRoles | Assign role |
| 25 | DELETE | `/api/v1/roles/{id}/users/{userId}` | Users.ManageRoles | Remove role |
| 26 | GET | `/api/v1/permissions` | Roles.View | List permissions |
| 27 | GET | `/health` | Public | Health check |
