# API Optimization Analysis – OAN Access-to-Credit System
_Generated: 2026-06-13 · Backend resolutions applied: 2026-06-24_

> ## Resolution status (backend)
> | # | Priority action | Status |
> |---|-----------------|--------|
> | 1 | `get_leads` / `get_all_loans` server-side pagination | ✅ Done (already present) |
> | 2 | DB indexes on `status`, `assigned_to` for the leads query | ✅ Done (`search_index`; apply on `bench migrate`) |
> | 3 | Eliminate `get_visit_schedules` bulk prefetch (**critical**) | ✅ Done — latest visit folded into `get_leads` |
> | 4 | `get_lead_metadata` server-side caching | ✅ Done (Redis, 1h TTL) |
> | 5 | Atomic loan creation (drop `update_lead_status` + refetch) | ✅ Done — lead → `Processed` in `create_loan_application` |
> | 6 | `create_lead` returns full lead object | ✅ Already resolved (no change needed) |
> | — | `get_lead_detail` aggregate endpoint (collapse Group A's 5 calls) | ⬜ Open (not yet built) |
> | — | Memoize/debounce frontend calls (`get_full_profile`, `get_assignable_users`, …) | ⬜ Frontend-only (out of backend scope) |
>
> All backend changes verified by `oan_a2c` test suites (`test_a2c_lead` 34/34, `test_loan_api` 11/11).
> **Frontend follow-ups** are called out inline per item.

---

## 1. API Call Grouping (Co-Called APIs)


### Group A: Lead Detail Page Load (5 concurrent calls)
When a user opens a lead detail view, the frontend fires all of the following in parallel:

| Call | Endpoint |
|------|----------|
| Lead basic info | `get_basic_profile?lead_id=` |
| Credit info | `get_lead_credit_infos?lead_id=` |
| Call logs | `get_lead_call_logs?lead_id=` |
| Timeline / activities | `get_lead_timeline?lead_id=` |
| Visit schedules | `get_visit_schedules?lead_id=` |

**Implementation Note:** The orchestrator component for this view is `NewLeadDashboard` (renamed from `LeadDashboard` and relocated from `src/features/leads/components/` to `src/features/new-lead/components/new-lead/NewLeadDashboard.tsx`), since it is composed entirely of `new-lead` selection and display sub-sections.

---

### Group B: Leads Dashboard Initial Load (3 concurrent calls)
Every time the leads dashboard mounts or filters change:

| Call | Endpoint |
|------|----------|
| Lead list | `get_leads?{filters}` |
| Lead summary/counts | `get_lead_summary` |

---

### Group C: Loan Dashboard Initial Load (2 concurrent calls)

| Call | Endpoint |
|------|----------|
| Loan list | `get_all_loans?{filters}` |
| Loan summary/counts | `get_loan_summary` |


---

### Group D: New Loan Application Creation — ✅ collapsed to 1 call
`createAndVerifyLoanApplicationThunk` previously chained 3 sequential calls:

1. `create_loan_application` → returns `application_id`
2. ~~`update_lead_status` → status → `"Processed"`~~ — ✅ **now atomic.** `create_loan_application`
   advances the lead to `Processed` itself (only from `Active`/`Verified`; never overrides a
   terminal state) and returns `lead_status` + `lead_status_updated` in its response.
3. ~~`get_all_loans?lead_id=` → refetch~~ — ✅ **unnecessary.** `create_loan_application` already
   returns the full `application` object.

**Frontend follow-up:** drop calls 2 and 3 from the thunk; use the single
`create_loan_application` response for both the new loan and the updated lead status.


---

### Group E: Lead Creation + Metadata (2 calls on New Lead form mount)

| Call | Endpoint |
|------|----------|
| Lead metadata (sources, statuses, loan types) | `get_lead_metadata` |
| _(After creation)_ Specific lead fetch | `get_leads?search_query={lead_id}` |


---

## 2. Call Frequency & Priority

### High-Frequency (optimize first)

| Endpoint | Trigger | Frequency |
|----------|---------|-----------|
| `get_leads` | Every filter change, tab switch, status update | Very High |
| `get_lead_summary` | Same as above (paired with get_leads) | Very High |
| `get_visit_schedules` (all 2000) | Every leads list render | ✅ **Resolved** (latest visit now folded into `get_leads`) |
| `get_lead_detail` sub-calls | Every lead card click | High |
| `get_all_loans` | Every loan filter change | High |
| `get_loan_summary` | Paired with get_all_loans | High |
| `update_loan_step` | Every wizard step navigation (prev/next) | High |

**Priority actions:**
- ✅ **Done** — `get_leads` and `get_all_loans` are server-side paginated (`start`/`page_length`,
  default 20, with `total_count`). _(Stale-while-revalidate caching is a separate, optional frontend layer.)_
- ✅ **Done** — Added DB indexes (`search_index`) on `status` and `assigned_to` (apply on next
  `bench migrate`). `creation` is indexed by Frappe natively; `lead_id` filters resolve via the
  linked-doctype subquery so no extra index needed on Lead itself.
- ✅ **Done** — `get_visit_schedules` bulk prefetch eliminated. `get_leads` now folds each lead's
  **latest** visit (`visit_date` + `schedule_status`) into the list response via a single query
  scoped to the current page's leads (mirrors the existing credit-info batch pattern). No field is
  stored on the Lead and no write-back hook fires on visit changes — so there is no sync cost or
  staleness, and it stays robust if `get_visit_schedules` changes later.
  - **Frontend follow-up:** stop calling the bulk `get_visit_schedules` on list render; read
    `schedule_status` / `visit_date` from the `get_leads` response instead. _(`get_visit_schedules`
    remains the right endpoint for the lead **detail** page's full visit history — Group A.)_

---

### Medium-Frequency

| Endpoint | Trigger |
|----------|---------|
| `get_lead_credit_infos` | Lead detail open |
| `get_lead_timeline` | Lead detail open |
| `get_lead_call_logs` | Lead detail open |
| `get_full_profile` | Loan detail modal open |
| `get_supporting_documents` | Loan detail modal open |

**Priority actions:**

- Memoize `get_full_profile`, `get_supporting_documents`, and `get_credit_info` per `application_id` during a session.

---

### Low-Frequency (no special optimization needed)

| Endpoint | Trigger |
|----------|---------|
| `login` / `logout` | Session boundary |
| `create_lead` | New lead form submit |
| `create_loan_application` | Loan form initiation |
| `upload_supporting_documents` | Document upload |
| `delete_supporting_document` | Document delete |
| `schedule_visit` | Visit scheduling |
| `update_visit_schedule_status` | Status update on visit |
| `search_farmer` | Fayda ID lookup |
| `request_otp` / `verify_otp` | Consent flow |
| `get_assignable_users` | Assignment modal open, search input |

**Priority actions:**
- Debounce `get_assignable_users` (search-as-you-type) with a 300ms delay and a minimum 2-character threshold.
---

## 3. Data Flow & Dependencies (Request Chains)

### Chain 1: New Lead Consent Flow
```
searchFarmer(fayda_id)
  └─► sendOtpAndCreateConsent(lead_id, fayda_id, ...)  [needs lead_id from prior step or existing lead]
        └─► verifyOtp(lead_id, otp_code)
              └─► fetchLeadDetails(lead_id)             [confirms consent state]
```
**Optimization:** `verifyOtp` response should return the updated lead state so `fetchLeadDetails` is unnecessary.

---

### Chain 2: Loan Application Creation — ✅ Resolved
```
createLoanApplication(lead_id)   [returns application object + lead_status='Processed', atomically]
```
**Status:** Done. The backend endpoint is now atomic — it advances the lead to `Processed` and
returns the full new loan object, so `updateLeadStatus` and the `getLoans` refetch are no longer
needed (see Group D above). Verified by `test_8_create_loan_application_copies_profile_details`.

---

### Chain 3: Loan Wizard Navigation
```
createLoanApplication(lead_id)   [on wizard start]
  └─► updateLoanStep(id, step)   [on each Next click]
  └─► updateLoanStep(id, step)   [on each Back click]
  ...
  └─► uploadSupportingDocument() [step-gated]
  └─► submitApplication()        [final step]
```

---



-
### On User Action (lazy, triggered)
| Data | Trigger | Endpoint |
|------|---------|----------|
| Lead detail | Click lead card | `get_lead_detail` (proposed aggregate) |
| Loan full profile | Open loan modal | `get_full_profile` |
| Supporting documents | Open docs tab in loan modal | `get_supporting_documents` |
| Loan credit info | Open credit tab | `get_credit_info` |
| Assignable users | Open assign modal + type | `get_assignable_users` (debounced) |
| Farmer search | Fayda ID submit | `search_farmer` |
| OTP request | Consent form submit | `request_otp` |

---

### On Filter Change (debounced, ~400ms)
| Data | Endpoint |
|------|----------|
| Filtered lead list | `get_leads` |
| Filtered loan list | `get_all_loans` |

---

### Optimistic Updates (no refetch needed)
| Action | Optimistic behavior |
|--------|-------------------|
| `update_lead_status` | Update Redux state immediately; revert on error |
| `assign_lead` | Update `assignedTo` field in lead record immediately |
| `update_visit_schedule_status` | Update status locally |
| `add_lead_comment` | Append comment to timeline locally |
| `add_lead_credit_info` | Append credit item locally |

---

### Polling / WebSocket (future consideration)
| Use Case | Recommendation |
|----------|---------------|
| Lead status changes (from external webhook, e.g. consent callback) | Short-poll `/get_leads` every 30s OR use WebSocket push for status-change events |
| Loan status changes (bank processing) | Same — poll `get_loan_summary` or subscribe to push |
| OTP verification result | Already synchronous via `verify_otp` — no change needed |

---


-
## 6. Response Shape Optimization

### Over-fetching Issues

#### `get_leads` response
The frontend only renders: `id, name, phone, status, location, loanType, loanAmount, source, assignedTo, creation, visitDate, scheduleStatus`.

Currently the response likely includes full Frappe document metadata (`owner`, `modified_by`, `docstatus`, `idx`, `__islocal`, etc.). Strip these server-side.

**Recommendation:** Return a projection:
```json
{
  "results": [
    {
      "lead_id": "string",
      "full_name": "string",
      "phone": "string",
      "status": "string",
      "location": "string",
      "loan_type": "string",
      "loan_amount": "number",
      "lead_source": "string",
      "assigned_to": "string | null",
      "creation": "ISO8601",
      "visit_date": "ISO8601 | null",
      "schedule_status": "string | null",
      "farmer_id": "string | null",
      "consent_date": "ISO8601 | null"
    }
  ],
  "total_count": "number",
  "summary": {
    "total": 0, "active": 0, "verified": 0,
    "processed": 0, "rejected": 0, "dormant": 0
  }
}
```

---


#### `get_lead_metadata` response — ✅ backend cached
This is static configuration data (`sources`, `statuses`, `loan_types`) derived from doctype Select
options, which only change on `bench migrate`.
- ✅ **Done** — now cached server-side in Redis (`frappe.cache()`, key `a2c_lead_metadata`,
  `expires_in_sec=3600`). RBAC is still enforced on every request; only the meta computation is cached.
- _Optional frontend layer:_ store in Redux with a `fetchedAt` timestamp / embed at build time if it
  rarely changes — no longer required for backend load, but reduces round trips further.

---



### Under-fetching Issues

#### `create_lead` response — ✅ already resolved
~~Returns `{ status, lead_id, message }`~~ — `create_lead` **already returns the full lead object**
(`data.lead` with name, phone, names, email, source, external_id, status) alongside `lead_id`. The
post-creation `get_leads?search_query={lead_id}` refetch is therefore unnecessary.
**Frontend follow-up:** consume `data.lead` from the `create_lead` response instead of refetching.




