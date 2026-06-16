# API Optimization Analysis – OAN Access-to-Credit System
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

### Group D: New Loan Application Creation (3 sequential calls)
`createAndVerifyLoanApplicationThunk` chains these in sequence:

1. `create_loan_application` → returns `application_id`
2. `update_lead_status` → status → `"Processed"`
3. `get_all_loans?lead_id=` → refetches to confirm state


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
| `get_visit_schedules` (all 2000) | Every leads list render | Very High — **critical problem** |
| `get_lead_detail` sub-calls | Every lead card click | High |
| `get_all_loans` | Every loan filter change | High |
| `get_loan_summary` | Paired with get_all_loans | High |
| `update_loan_step` | Every wizard step navigation (prev/next) | High |

**Priority actions:**
- Add server-side pagination cache / stale-while-revalidate for `get_leads` and `get_all_loans`.
- Add a DB index on `lead_id`, `status`, `creation`, and `assigned_to` for the leads query.
- Eliminate or paginate the `get_visit_schedules` bulk prefetch immediately.

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
              └─► get_basic_profile(lead_id)           [fetches dynamic consent metadata & farmer profile]
```
**Optimization:** `verifyOtp` response should ideally return the updated lead state and consent metadata so the explicit `get_basic_profile` call after verification could be skipped. Currently, `get_basic_profile` supplies dynamic consent fields (e.g., `requested_data_fields`, `purpose`) securely mapped using strict nullish coalescing (`??`) to provide explicit defaults (`''` or `[]`) rather than allowing `undefined` to propagate into prop interfaces.

---

### Chain 2: Loan Application Creation
```
createLoanApplication(lead_id)           [returns application_id]
  └─► updateLeadStatus(lead_id, 'Processed')
        └─► getLoans({ lead_id })         [refetch to sync UI]
```
**Optimization:** Backend atomic endpoint (see Group D above). Return the new loan in `create_loan_application` response.

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


#### `get_lead_metadata` response
This is static configuration data (`sources`, `statuses`, `loan_types`). It should:
- Be cached with `Cache-Control: max-age=3600` on the backend.
- Be stored in Redux with a `fetchedAt` timestamp and only re-fetched if older than 1 hour.
- Consider embedding it in the HTML at build time via `getStaticProps` / `generateStaticParams` if it rarely changes.

---



### Under-fetching Issues

#### `create_lead` response
Returns `{ status, lead_id, message }` but the frontend immediately re-fetches the lead via `get_leads?search_query={lead_id}` to get the full lead object for the UI. The `create_lead` response should return the full lead object directly (same projection as `get_leads` results).




