# Frontend API Migration Guide — ERD Restructuring

## Context

The backend restructured its ERD to extract SubscriptionPlan, AcademicYear, Grade, and Section into standalone entities. This slimmed down the Schools API — several fields were removed from requests and responses. Subscription plans and academic years will be managed through dedicated API endpoints in future phases.

**Branch:** `feature/erd-adjustments`

---

## 1. Breaking Changes Summary

| Area | What Changed |
|------|-------------|
| Create School | Removed 3 fields from request body |
| Update School Settings | Removed 4 fields from request body |
| School Detail Response | Removed `subscriptionPlan`, `currentAcademicYear` |
| School List Response | Removed `subscriptionPlan` |
| Settings Response | Removed 4 payment-related fields |

---

## 2. Create School — `POST /api/schools`

### Removed fields (do NOT send these anymore):

| Field | Type | Reason |
|-------|------|--------|
| `subscriptionPlan` | string | Auto-assigned (Free plan by default) |
| `academicYearStart` | int | Auto-assigned (current global year) |
| `academicYearEnd` | int | Auto-assigned (current global year) |

### Current request body:

```json
{
  "name": "Baghdad International School",
  "code": "SCH-BGD-001",
  "city": "Baghdad",
  "address": "Al-Mansour District",
  "phone": "+964-770-123-4567",
  "contactEmail": "info@school.edu.iq",
  "logoUrl": "https://..."
}
```

Only `name`, `code`, and `city` are required. The rest are optional.

### Frontend action:
- Remove subscription plan selector from school creation form
- Remove academic year inputs from school creation form
- Both are now auto-assigned by the backend on school creation

---

## 3. Update School Settings — `PUT /api/schools/{id}/settings`

### Removed fields (do NOT send these anymore):

| Field | Type | Reason |
|-------|------|--------|
| `allowPartialPayments` | bool | Moved to SubscriptionPlan entity |
| `allowInstallments` | bool | Moved to SubscriptionPlan entity |
| `maxInstallments` | int | Moved to SubscriptionPlan entity |
| `lateFeePercentage` | decimal | Moved to SubscriptionPlan entity |

### Current request body:

```json
{
  "currency": "IQD",
  "timezone": "Asia/Baghdad",
  "defaultLanguage": "ar"
}
```

### Frontend action:
- Remove payment policy fields from the school settings form
- Settings form should only show: Currency, Timezone, Default Language
- Payment policies will be managed via a future Subscription Plans admin panel

---

## 4. School Detail Response — `GET /api/schools/{id}`

### Before:

```json
{
  "id": "uuid",
  "name": "Baghdad International School",
  "code": "SCH-BGD-001",
  "address": "Al-Mansour District",
  "city": "Baghdad",
  "phone": "+964-770-123-4567",
  "contactEmail": "info@school.edu.iq",
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
    "maxInstallments": 3,
    "lateFeePercentage": 5.0
  },
  "admins": [
    {
      "userId": "uuid",
      "fullName": "Ahmed Al-Rashid",
      "email": "ahmed@school.edu.iq",
      "isPrimary": true,
      "assignedAt": "2026-02-22T..."
    }
  ],
  "createdAt": "2026-02-22T..."
}
```

### After:

```json
{
  "id": "uuid",
  "name": "Baghdad International School",
  "code": "SCH-BGD-001",
  "address": "Al-Mansour District",
  "city": "Baghdad",
  "phone": "+964-770-123-4567",
  "contactEmail": "info@school.edu.iq",
  "logoUrl": null,
  "status": "Active",
  "settings": {
    "currency": "IQD",
    "timezone": "Asia/Baghdad",
    "defaultLanguage": "ar"
  },
  "admins": [
    {
      "userId": "uuid",
      "fullName": "Ahmed Al-Rashid",
      "email": "ahmed@school.edu.iq",
      "isPrimary": true,
      "assignedAt": "2026-02-22T..."
    }
  ],
  "createdAt": "2026-02-22T..."
}
```

### Frontend action:
- Remove `subscriptionPlan` badge/label from school detail page
- Remove `currentAcademicYear` display from school detail/header
- Remove payment policy section from settings display
- These will return via dedicated endpoints in future phases

---

## 5. School List Response — `GET /api/schools`

### Before:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Baghdad International School",
      "code": "SCH-BGD-001",
      "city": "Baghdad",
      "logoUrl": null,
      "subscriptionPlan": "Premium",
      "status": "Active",
      "createdAt": "2026-02-22T..."
    }
  ],
  "pageNumber": 1,
  "totalPages": 1,
  "totalCount": 3,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

### After:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Baghdad International School",
      "code": "SCH-BGD-001",
      "city": "Baghdad",
      "logoUrl": null,
      "status": "Active",
      "createdAt": "2026-02-22T..."
    }
  ],
  "pageNumber": 1,
  "totalPages": 1,
  "totalCount": 3,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

### Frontend action:
- Remove subscription plan column/badge from the schools list/table

---

## 6. Endpoints — No Route Changes

All 10 school endpoints remain at the same URLs with the same HTTP methods:

| Method | Route | Change |
|--------|-------|--------|
| GET | `/api/schools` | Response shape simplified |
| GET | `/api/schools/{id}` | Response shape simplified |
| GET | `/api/schools/my-school` | Response shape simplified |
| POST | `/api/schools` | Request body simplified |
| PUT | `/api/schools/{id}` | No change |
| PATCH | `/api/schools/{id}/status` | No change |
| PUT | `/api/schools/{id}/settings` | Request body simplified |
| POST | `/api/schools/{id}/admins` | No change |
| DELETE | `/api/schools/{id}/admins/{userId}` | No change |
| DELETE | `/api/schools/{id}` | No change |

---

## 7. TypeScript Type Updates

If you have TypeScript interfaces, update them:

```typescript
// REMOVE these types
interface AcademicYearDto {
  startYear: number;
  endYear: number;
  label: string;
}

// UPDATE SchoolSettings - remove payment fields
interface SchoolSettings {
  currency: string;
  timezone: string;
  defaultLanguage: string;
  // REMOVED: allowPartialPayments, allowInstallments, maxInstallments, lateFeePercentage
}

// UPDATE SchoolDto - remove subscriptionPlan and currentAcademicYear
interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  city: string;
  phone?: string;
  contactEmail?: string;
  logoUrl?: string;
  status: string;
  settings: SchoolSettings;
  admins: SchoolAdmin[];
  createdAt: string;
  // REMOVED: subscriptionPlan, currentAcademicYear
}

// UPDATE SchoolSummary - remove subscriptionPlan
interface SchoolSummary {
  id: string;
  name: string;
  code: string;
  city: string;
  logoUrl?: string;
  status: string;
  createdAt: string;
  // REMOVED: subscriptionPlan
}

// UPDATE CreateSchool request - remove 3 fields
interface CreateSchoolRequest {
  name: string;
  code: string;
  city: string;
  address?: string;
  phone?: string;
  contactEmail?: string;
  logoUrl?: string;
  // REMOVED: subscriptionPlan, academicYearStart, academicYearEnd
}

// UPDATE UpdateSchoolSettings request - remove 4 fields
interface UpdateSchoolSettingsRequest {
  currency: string;
  timezone: string;
  defaultLanguage: string;
  // REMOVED: allowPartialPayments, allowInstallments, maxInstallments, lateFeePercentage
}

// NO CHANGE
interface SchoolAdmin {
  userId: string;
  fullName: string;
  email: string;
  isPrimary: boolean;
  assignedAt: string;
}
```

---

## 8. What's Coming Next (Future Phases)

These features will be added in upcoming PRs with their own dedicated API endpoints:

| Phase | Module | New Endpoints |
|-------|--------|---------------|
| 2 | Subscription Plans | `GET /api/plans`, `POST /api/plans`, `POST /api/schools/{id}/subscribe` |
| 3 | Academic Years | `GET /api/academic-years`, `POST /api/academic-years` |
| 4 | Grades & Sections | Part of the Students module |

The subscription plan and academic year data that was removed from the school response will be accessible through these new endpoints.
