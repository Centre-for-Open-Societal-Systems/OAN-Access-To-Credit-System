# skills.md — Technical Expertise Matrix

## The Stack — Libraries In Use
Every review is conducted against these technologies at these versions. A dependency or pattern outside this set is, by default, suspect and must be justified (see `rules.md` §19 Dependency & Package Hygiene).

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | ^16.2.9 |
| UI Library | React | ^19.2.7 |
| Language | TypeScript | ^6.0.3 |
| State | Redux Toolkit + React Redux | ^2.12.0 / ^9.3.0 |
| Styling | Tailwind CSS v4 | ^4.3.0 |
| Variant API | Class Variance Authority (CVA) | ^0.7.1 |
| Class Merging | clsx + tailwind-merge | ^2.1.1 / ^3.6.0 |
| Icons | Lucide React | ^1.17.0 |
| CSS Pre-processing | Sass | ^1.100.0 |
| API Mocking | MSW v2 | ^2.14.6 |
| Build | PostCSS + Autoprefixer | ^8.5.x / ^10.5.x |

The detection techniques below map one-to-one onto the 25 check domains (`agent.md`) and their rules (`rules.md`) — domains 1–20 are the stack-wide baseline, domains 21–25 are the supplementary high-stakes concerns.

---

## 1. TypeScript Mastery

- **Advanced Type Composition:** Conditional types, mapped types, `infer`, template literal types, variadic tuples. Can read complex type-level programs and identify where they widen or narrow types unintentionally.
- **Discriminated Union Analysis:** Identifies state shapes using optional fields where discriminated unions should be used. Recognizes states that are technically representable by the type but semantically impossible — the type system should make those states unrepresentable.
- **`tsconfig` Expertise:** Full knowledge of every `compilerOptions` flag relevant to strictness, module resolution, and output. Knows which missing flag enables which class of runtime bug.
- **Assertion Safety Analysis:** Detects unsafe `as` casts and recognizes the double-assertion pattern (`as unknown as Target`) — a signal that the developer knew the assertion was unsound and forced it through anyway.
- **Generic Constraint Analysis:** Detects overly permissive constraints (`T extends object`) and recognizes where constraints are missing entirely, allowing types to flow through that should have been rejected.

---

## 2. React 19 & Next.js App Router

- **Server vs. Client Boundary:** Knows what data, state, and behavior belongs in each layer. Can detect a Server Component importing a browser-only module, or a Client Component escalated unnecessarily — blocking streaming with no benefit.
- **Streaming & Suspense Topology:** Understands `<Suspense>` placement, `loading.tsx` vs inline boundaries, and how boundary granularity affects perceived performance and streaming behavior.
- **Hydration Mismatch Detection:** Recognizes patterns that cause server/client HTML divergence — conditional rendering on `typeof window !== 'undefined'`, non-deterministic IDs, dates formatted without locale stabilization.
- **Hook Rules Compliance:** Detects conditional hook calls, hooks called in non-component functions, and hooks used inside Server Components — all silent failures or runtime errors.
- **`useEffect` Abuse Taxonomy:** Can identify the full spectrum of misuse: derived state synchronization, missing cleanup, stale closure capture, over-specified or under-specified dependency arrays.
- **Route Architecture Evaluation:** Can evaluate App Router directory structures for correctness — misplaced segment files, incorrect `layout.tsx` scope, overly broad middleware matchers, missing `error.tsx` and `loading.tsx` coverage.

---

## 3. Redux Toolkit & State Architecture

- **Slice Boundary Violations:** Identifies when two slices share state that belongs together (under-splitting) or when one slice aggregates unrelated domains (over-aggregation into a god slice).
- **Selector Pathology:** Detects inline `useSelector` derivations that execute on every state update regardless of whether the derived value changed. Understands Redux's reference equality re-render model.
- **Thunk Rejection Coverage:** Identifies `createAsyncThunk` definitions whose consuming `extraReducers` are missing the `rejected` case handler — errors silently discarded.
- **RTK Query Tag Analysis:** Can evaluate cache tag topology — detects missing tag definitions, over-broad invalidation strategies, and endpoints bypassing the cache entirely when they should not.
- **Normalization Gaps:** Identifies Redux state storing arrays of domain entities that should use `createEntityAdapter` for O(1) lookup and atomic updates.

---

## 4. Styling Architecture (Tailwind v4 + CVA + Sass)

- **Tailwind Conflict Detection:** Knows which Tailwind classes conflict when concatenated without `twMerge`. Can identify components accepting `className` without routing it through `cn()`.
- **CVA Pattern Gap Detection:** Identifies components with multiple visual variants implemented through conditional class strings where `cva()` is the correct abstraction.
- **Arbitrary Value Repetition Audit:** Can scan for repeated `[value]` patterns and identify which should be extracted to `tailwind.config` as named design tokens.
- **Dark Mode Coverage Audit:** Can traverse a component's class list and identify color-bearing classes without corresponding `dark:` variants.
- **Sass Scope Violations:** Identifies Sass files implementing styles that Tailwind handles idiomatically — detecting where a parallel styling system has been introduced.

---

## 5. Performance Engineering

- **Core Web Vitals Regression Detection:** Knows which patterns degrade LCP (unoptimized images, render-blocking resources), INP (long tasks, synchronous event handlers on scroll/resize), and CLS (images without explicit dimensions, content inserted above existing content).
- **Unnecessary Re-render Detection:** Can read a component tree and predict which parent state changes cascade unnecessarily into deeply nested child re-renders in the absence of memoization.
- **Bundle Risk Assessment:** Recognizes commonly large libraries and can identify imports that pull the entire library rather than a specific sub-path, defeating tree-shaking.
- **Dynamic Import Candidate Identification:** Can evaluate a component tree and identify which components are included in the initial bundle but should be loaded lazily.
- **`useEffect` Derived State Anti-Pattern:** Detects the full pattern: `useState` initialized from a prop, a `useEffect` synchronizing it when the prop changes — a synchronization bug that produces stale state on intermediate renders.

---
## 6. Security Analysis

### Input Sanitization
- **Schema validation vs. content sanitization distinction:** Understands that Zod validates *shape and type* — it does not strip XSS payloads from string values that conform to the expected type. Can identify fields where structural validation passes but content sanitization is absent.
- **Prototype pollution vector detection:** Recognizes `JSON.parse(untrustedData)` spread directly into application objects and identifies where `__proto__` and `constructor` key injection could pollute the prototype chain.
- **Null byte and overlong input detection:** Identifies Zod schemas on string fields missing `max()` constraints and `.regex()` guards against control characters on fields feeding into system calls, file paths, or shell commands.
- **URL parameter trust boundary tracing:** Follows values from `useSearchParams`, `useParams`, `router.query`, and `window.location` to their first rendered or persisted use, identifying every point where user-controlled URL data enters the application without validation.

### XSS Prevention
- **Full XSS vector enumeration:** Identifies all DOM-write vectors beyond `dangerouslySetInnerHTML` — `href` injection via `javascript:` or `data:` URIs, dynamic `src` attributes on media and script elements, `innerHTML` writes via direct DOM API calls bypassing React's escaper, and `eval()`/`new Function()` usage.
- **`target="_blank"` reverse tabnapping detection:** Identifies every external `<a>` element without `rel="noopener noreferrer"` and understands the `window.opener` redirection attack this enables.
- **DOM-based XSS tracing:** Follows data from user-controlled sources (URL parameters, `postMessage` listeners, `localStorage` reads) through to sink operations that write to the DOM.
- **Template injection awareness:** Recognizes patterns where user-controlled values are interpolated into strings that are subsequently evaluated — server-side template injection risks surfacing in isomorphic rendering contexts.

### CSRF Protection
- **Server Action origin validation audit:** Reads Next.js Server Action definitions and identifies those performing state mutations without `Origin` header validation against a known allowlist.
- **API route method semantics:** Identifies `GET` handlers performing database mutations — a CSRF vulnerability and HTTP semantics violation simultaneously.
- **Cookie `SameSite` verification:** Reads cookie configuration and identifies auth cookies missing `SameSite=Strict` or `SameSite=Lax` — the minimum CSRF mitigation for cookie-based sessions.
- **CSRF token pattern detection:** Can identify whether a synchronizer token or double-submit cookie pattern is implemented, and whether it covers all mutating endpoints.

### Secure Headers
- **CSP completeness audit:** Can read a `Content-Security-Policy` definition and evaluate directive completeness — identifying missing `default-src`, absent `frame-ancestors`, and directives weakened by `unsafe-inline` or `unsafe-eval` to a point of ineffectiveness.
- **Security header presence audit:** Reads `next.config` `headers()` configuration and identifies which of the six mandatory security headers are absent: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- **Header placement audit:** Distinguishes between headers set at the application layer (`next.config`) and headers set only at the CDN or load balancer layer, flagging the latter as infrastructure-dependent security that the application does not control.

### Cookie Security
- **Cookie attribute audit:** Reads cookie creation code and identifies auth cookies missing any of `HttpOnly`, `Secure`, or a valid `SameSite` value.
- **Expiry policy analysis:** Evaluates session versus persistent cookie lifetime and flags unbounded expiry settings.

### General Exposure Detection
- **Secret exposure scanning:** Detects hardcoded credentials, API keys embedded in constants, and `NEXT_PUBLIC_` environment variables containing server-side secrets.
- **PII in log output detection:** Identifies `console.*` calls printing user email addresses, names, tokens, session IDs, or other personally identifying fields.
- **Runtime CVE cross-reference:** Recognizes commonly vulnerable package versions and flags them as security findings distinct from general package hygiene.

---

## 7. Testing (MSW v2)

- **Handler Coverage Audit:** Can read a component's data-fetching logic and enumerate every API endpoint requiring an MSW handler — then identify which are absent.
- **State Coverage Verification:** Can read a test file and identify which of the four states (loading, error, empty, success) have assertions and which are untested.
- **Behavior vs. Implementation Testing:** Detects tests asserting on internal state values, ref contents, or component method calls rather than observable, user-facing behavior.
- **Timing Fragility Detection:** Identifies `setTimeout`-based test patterns, non-deterministic async assertions, and missing `waitFor` wrapping on async state updates.

---

## 8. Code Hygiene & Static Analysis

- **Dead Code Detection:** Identifies unreachable code paths (conditions that are always true or always false, code following a `return`, imports of unused symbols), commented-out blocks, and exported symbols never imported.
- **Debug Artifact Detection:** Recognizes `console.*` calls, `debugger` statements, and verbose logging not guarded by a `NODE_ENV` check.
- **Magic Value Detection:** Identifies repeated literal strings and numbers that should be named constants, centralized, and typed.

---

## 9. File & Folder Structure Analysis

- **Convention Consistency Audit:** Determines whether a project is following a feature-based or layer-based convention, then identifies every file violating the established pattern.
- **Barrel File Topology:** Traces barrel re-exports to identify where circular dependencies are introduced and where tree-shaking is defeated by re-exporting side-effecting modules.
- **Colocation Gap Detection:** Identifies test files, story files, and style modules disconnected from their source components.
- **Module Boundary Violations:** Detects cross-domain imports where a feature module reaches into another feature module's internal implementation rather than its public API surface.
- **Circular Dependency Tracing:** Follows import chains to detect cycles.

---

## 10. Naming Convention Enforcement

- **File Naming Audit:** Can scan a directory listing and identify files violating PascalCase (components), camelCase (hooks/utils), or UPPER_SNAKE (constants) conventions.
- **Boolean Prop Naming:** Detects boolean-typed props missing the `is/has/can` prefix — where type signal is lost and prop intent is ambiguous.
- **Redux Action Pattern Audit:** Identifies slice action names not following `domain/verb`, making the Redux DevTools log unreadable at scale.
- **Handler vs. Prop Naming Discipline:** Detects `onClick` implementations named `onClick` (should be `handleClick`) and event prop interfaces missing the `on` prefix.

---

## 11. Next.js App Router Expertise

- **Metadata Coverage Audit:** Can traverse the App Router route tree and identify every `page.tsx` missing a `metadata` export or `generateMetadata` function.
- **Cache Strategy Audit:** Reads Server Component data fetching and identifies `fetch` calls without an explicit cache directive, relying on unpredictable implicit defaults.
- **Boundary Necessity Analysis:** Can determine whether a `'use client'` directive is required (interactivity, browser APIs, React state) or unnecessary — and identifies the specific trigger forcing the escalation.
- **Error and Loading Boundary Coverage:** Traces the route tree to identify segments with async data fetching or potential throws that lack `error.tsx` or `loading.tsx`.
- **Middleware Matcher Precision:** Evaluates middleware matchers and identifies overly broad patterns running on static asset routes or API health endpoints.

---

## 12. React-Specific Pitfall Detection

- **Falsy `&&` Rendering:** Detects `{value && <Component />}` patterns where `value` can be `0`, `''`, or `NaN` — all of which produce a visible DOM node on the page.
- **Key Prop Stability:** Identifies `key={index}` in dynamic lists where items can be added, removed, or reordered — causing reconciliation failures and state retention across position changes.
- **Controlled/Uncontrolled Mixing:** Detects inputs transitioning between having a `value` prop and not having one — a React warning producing undefined behavior.
- **Ref vs. State Misuse:** Identifies `useRef` holding values whose change should schedule a re-render, silently breaking reactivity.
- **Strict Mode Violation Detection:** Recognizes effects with initialization logic that would break when invoked twice — missing cleanup, non-idempotent setup, or assumptions about single execution.

---

## 13. Accessibility (A11y)

- **Semantic HTML Audit:** Traverses JSX and identifies `<div>` or `<span>` elements carrying `onClick`, `onKeyDown`, `role`, or interactive class names that should be native interactive elements.
- **ARIA Correctness:** Knows the ARIA Authoring Practices well enough to identify incorrect role usage, redundant ARIA on semantic elements, and missing required ARIA attributes for composite widgets (e.g., `aria-expanded` on a disclosure button, `aria-selected` on a tab).
- **Keyboard Navigation Analysis:** Traces the interactive element tree and identifies elements that cannot receive focus, lack keyboard event handlers, or fail to respond to Enter and Space.
- **Focus Management Audit:** Identifies modals, drawers, and dialogs missing focus trapping on open and focus restoration to the trigger on close.
- **Form Accessibility Audit:** Detects inputs without associated labels, error messages without `aria-describedby`, required fields without `aria-required`, and dynamic updates without `aria-live` regions.

---

## 14. Form Handling Analysis

- **State Coverage Check:** Can read a form component and identify which of the four form states (idle, submitting, error, success) have explicit handling in the render output.
- **Zod Schema Coverage:** Identifies fields without corresponding validation rules and schemas missing edge case coverage (empty strings, whitespace-only input, boundary values).
- **Submission Guard Check:** Detects submit buttons that are not disabled during in-flight request states.
- **Schema Colocation:** Identifies Zod schemas defined inline inside component bodies that belong in dedicated domain files.

---

## 15. SEO & Metadata Analysis

- **Metadata Completeness:** Can traverse the App Router tree and identify routes missing `metadata` exports or `generateMetadata` functions.
- **OG Tag Audit:** Verifies presence of `og:title`, `og:description`, `og:image`, and `og:url` in metadata output.
- **Internal Navigation Audit:** Detects plain `<a>` elements used for internal routing instead of `next/link`.
- **Canonical and noindex Coverage:** Identifies pages accessible through multiple paths without canonical tags, and identifies pages that should be noindexed but are not.

---

## 16. CSS & Animation Integrity

- **GPU-Unsafe Animation Detection:** Identifies CSS transitions and animations targeting layout-triggering properties (`top`, `left`, `width`, `height`, `margin`, `padding`).
- **z-index Scale Audit:** Detects inline or arbitrary z-index values not part of a named scale.
- **Responsive Coverage Gap:** Identifies components with desktop-only styling and no mobile or tablet breakpoint variants.
- **Dark Mode Gap Detection:** Traverses component class lists and identifies color-bearing classes without corresponding `dark:` variants.
- **Overflow Risk Detection:** Identifies containers receiving dynamic or user-generated content without explicit overflow rules.

---

## 17. i18n Readiness Analysis

- **Hardcoded String Detection:** Identifies string literals in JSX render output and prop values that are not i18n key references.
- **Directional Property Audit:** Identifies Tailwind classes using physical direction properties (`ml-`, `mr-`, `left-`, `right-`) instead of logical properties (`ms-`, `me-`, `start-`, `end-`).
- **Locale-Aware Formatting Check:** Detects hardcoded date, number, and currency format strings that will not adapt to non-default locales.
- **Plural Hardcoding Detection:** Identifies ternary expressions handling singular/plural forms inline instead of through an i18n system.

---

## 18. API & Data Boundary Analysis

- **Zod Boundary Tracing:** Follows data from a `fetch` response through to its first use in Redux state or component render output, identifying every point it enters the application without validation.
- **Race Condition Detection:** Identifies data-fetching patterns where sequential requests can resolve out of order without cancellation of superseded requests.
- **PII Exposure Scan:** Identifies where user-identifying information (email, name, phone, tokens) appears in `console.log`, Redux state keys visible in DevTools, or `localStorage` values.
- **RTK Query Over-Broad Invalidation:** Identifies cache tag configurations where a single mutation invalidates tags belonging to unrelated data domains.

---

## 19. Dependency & Package Analysis

- **Unused Dependency Detection:** Correlates `package.json` entries against actual import usage across the codebase to surface installed but unreferenced packages.
- **Bundle Impact Assessment:** Recognizes common large libraries and can identify when a dependency is disproportionately large relative to its role in the codebase.
- **Vulnerability Status:** Identifies packages with known CVEs and can assess their severity relative to how the package is used in production code.
- **License Identification:** Can identify GPL, AGPL, and other copy-left licensed packages and flag their incompatibility with commercial proprietary products.
- **DevDependency Leakage:** Identifies test and build tools incorrectly listed under `dependencies` rather than `devDependencies`.

---

## 20. Environment & Configuration Safety

- **`NEXT_PUBLIC_` Audit:** Scans environment variable usage and identifies variables with secret-sounding names carrying the client-bundle-embedding prefix.
- **Build-Time Validation Gap:** Identifies codebases accessing `process.env` directly without a validated schema — apps that can silently start and fail only at the feature boundary where the missing variable is first used.
- **Dev-Only Code Guard Detection:** Identifies logging, mock initialization, or tooling setup executing unconditionally across all environments.
- **Hardcoded Endpoint Detection:** Identifies API base URLs, CDN paths, and service endpoints embedded as string literals rather than drawn from environment configuration.

---

## 21. Monetary & Numeric Integrity

- **Float-Money Detection:** Recognizes monetary values typed or computed as `number` and arithmetic performed in floating point, where integer minor units or a decimal library is required. Knows the classic `0.1 + 0.2` failure mode and where it surfaces in totals and interest math.
- **Currency Pairing Audit:** Identifies amounts rendered or passed without an accompanying currency, and detects mixed-currency arithmetic with no conversion step.
- **Rounding Consistency Analysis:** Detects ad-hoc `toFixed`/`Math.round` rounding scattered across the render layer instead of a single centralized rounding utility with an explicit mode.
- **Client-Authority Detection:** Identifies places where a balance, fee, or interest figure is computed on the client and presented as authoritative rather than rendered from a server-provided value.
- **Numeric Boundary Analysis:** Detects numeric inputs feeding mutations without precision, range, or sign constraints at the boundary.

---

## 22. Sensitive Data Handling & Privacy

- **Masking Gap Detection:** Identifies sensitive identifiers rendered in full by default where masking with an explicit reveal action is required.
- **Storage & URL Leakage Tracing:** Follows PII and sensitive identifiers into URLs, query strings, `localStorage`/`sessionStorage`, and analytics event payloads — every persistence or transmission surface readable beyond the intended boundary.
- **Log/Error PII Scan:** Extends the §6/§18 PII scan to UI-surfaced error messages and third-party error/analytics SDK payloads, not just `console.*`.
- **Over-Exposure Detection:** Identifies components receiving entire domain records when they render a single field — a data-minimization violation at the prop boundary.
- **Exfiltration-Surface Awareness:** Recognizes clipboard, autofill, and screenshot pathways that expose sensitive values without explicit user intent.

---

## 23. Authorization & Access Control (UI Layer)

- **Client-Gating-as-Security Detection:** Distinguishes UI affordance (hiding a control) from an enforced control, and flags any place where client-side gating is the *only* thing standing between the user and a privileged action.
- **Over-Rendered Control Detection:** Identifies controls rendered for actions the current role cannot perform — a least-privilege and UX defect.
- **Route Guard Analysis:** Detects protected segments gated by deep conditional rendering (with a content-exposing loading flash) rather than guarded at the boundary.
- **RBAC Centralization Audit:** Detects scattered, stringly-typed role comparisons (`role === 'admin'`) that should resolve through a single permission authority.
- **Step-Up Bypass Detection:** Identifies verification/re-auth gates whose "passed" state lives only in client state and is never reconfirmed server-side.

---

## 24. Auditability & Traceability

- **Correlation Propagation Audit:** Identifies state-mutating flows that do not propagate a correlation or request identifier, making an action impossible to reconstruct end to end.
- **Idempotency Gap Detection:** Detects irreversible or financial mutations submitted without an idempotency key, where a retry or double-submit can duplicate the effect — distinct from the §14 in-flight submission guard.
- **Silent Mutation Detection:** Identifies fire-and-forget mutations whose failure produces no observable, attributable result.
- **Log Structure Analysis:** Recognizes unstructured, unqueryable client logging and verifies it carries none of the sensitive payloads called out in domain 22.

---

## 25. Consent, Compliance & High-Impact Confirmation

- **Consent Capture Audit:** Identifies processing that proceeds without explicit, versioned, recorded consent — including pre-checked boxes and consent bundled with unrelated agreement.
- **Irreversible-Action Confirmation Detection:** Detects single-click paths to unrecoverable financial or data actions lacking a consequence-stating confirmation step.
- **Disclosure Association Audit:** Identifies required legal/regulatory disclosures that are present visually but not programmatically associated with the action they govern.
- **Server-Time Reliance Check:** Detects expiry, cooling-off, and verification countdowns driven by the client clock (`Date.now()`) rather than server time.
- **Timezone Correctness Analysis:** Identifies legally or financially significant timestamps and deadlines rendered without unambiguous, timezone-correct formatting.