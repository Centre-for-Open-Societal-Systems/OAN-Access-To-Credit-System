# rules.md — The Non-Negotiables (25 Check Domains)

Each section below defines the minimum standard for one check domain. Every item is a testable, specific rule — not a guideline. Deviation from any rule is a violation and must appear in the review report at the appropriate severity.

Domains 1–20 are the stack-wide baseline. Domains 21–25 are supplementary — domain-specific and cross-cutting concerns added because this is a **financial / lending platform** (leads, loans, credit information, consent, OTP) where a defect carries monetary, regulatory, or privacy consequence, not merely a UI one.

---

## 1. TypeScript Type Safety

- **No `any`.** If a type is genuinely unknown at declaration, `unknown` is the correct type and must be narrowed before use. `any` is a type-system bypass, not a valid typing strategy.
- **No unqualified type assertions.** `as SomeType` without an accompanying comment that proves the assertion is safe at that callsite is an unverified claim.
- **All exported functions and hooks must have explicit return types.** Inferred return types on public APIs create invisible contracts that break silently when the implementation changes.
- **Multi-state shapes must use discriminated unions.** A `status: 'idle' | 'loading' | 'success' | 'error'` with dependent data fields must be typed as a discriminated union — not an object with scattered optional fields that allow impossible states to be represented.
- **`tsconfig` strictness flags are non-negotiable:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnusedLocals`, `noUnusedParameters` must remain enabled. Any suppression via config change is itself a 🔴 Critical finding.
- **No `@ts-ignore` or `@ts-expect-error`** without a comment referencing a tracked issue and a written explanation of why the suppression is necessary.
- **TypeScript `enum` is prohibited.** Use `const` objects with `as const` or string literal unions. TypeScript enums introduce runtime overhead and produce bi-directional mapping behavior that creates bugs at module boundaries.

---

## 2. Component Architecture

- **One reason to re-render, one reason to exist.** A component that fetches data, transforms it, and renders a complex layout is at minimum three separate components.
- **All prop interfaces must be explicitly typed.** Props without explicit types are untyped contracts.
- **`readonly` must be applied to props not mutated within the component.** Absence signals mutability and misleads maintainers.
- **No inline ternary chains deeper than one level in JSX.** Beyond a single ternary, the intent is unreadable — this is a 🟡 Major finding.
- **Components with more than 8 props are suspect.** Not a hard limit, but a reliable signal that the component is absorbing too many responsibilities.
- **No prop-drilling beyond two levels.** A prop travelling through two or more components without being consumed by intermediaries indicates a structural failure in the component tree.
- **`'use client'` must be justified.** If the component contains no interactivity, no browser API usage, and no React state, `'use client'` is incorrect. Server Component is the default.
- **`children` must be typed as `React.ReactNode`.** Not `JSX.Element`, not `React.FC` — `ReactNode` is the correct union type for anything renderable as children.

---

## 3. State Management

- **Redux is for shared, cross-cutting state.** UI state local to a single component in Redux is over-engineering with a measurable performance cost.
- **One slice per business domain.** A catch-all "global" or "app" slice is a 🔴 Critical architectural violation.
- **All `useSelector` calls beyond a single property access must use memoized selectors via `createSelector`.** Inline derivation in `useSelector` runs on every state update regardless of whether the derived value changed.
- **No direct state mutation outside Immer's draft boundary.** Every reducer that does not use the Immer draft API is mutating Redux state directly.
- **All async operations must use `createAsyncThunk` or RTK Query.** Raw `fetch` inside a component, or `useEffect` + `setState` for server data, are architectural violations.
- **All `createAsyncThunk` calls must handle the `rejected` case.** A missing rejection handler means errors are silently discarded.
- **RTK Query cache tags must be defined and applied to all mutating endpoints.** Missing tag invalidation leaves the UI serving stale data with no reload trigger.
- **Collections requiring lookup-by-id must use `createEntityAdapter`.** Arrays of domain entities without normalization produce O(n) lookups on the most common access pattern.

---

## 4. Styling & Class Composition

- **Tailwind utility classes are the primary styling mechanism.** Inline `style` props with static values are a violation.
- **CVA is required for every component with two or more visual variants.** Hand-rolled conditional class strings across size, color, and state variants are unmaintainable at scale.
- **Every component accepting an external `className` prop must pass it through `cn()`.** Direct string concatenation does not resolve Tailwind class conflicts and produces unpredictable visual output.
- **No arbitrary Tailwind value appearing more than once across the codebase.** Repeated `[value]` patterns belong in `tailwind.config` as named design tokens.
- **Sass is scoped exclusively to:** complex keyframe animations, third-party library overrides, and design token definitions. Sass used as a general styling fallback is a violation.
- **No inline `style={{ ... }}`** for values expressible through Tailwind. If the value is static and cannot be expressed through Tailwind, it belongs in the config — not in the component.
- **Dark mode variants must be present for every element with a color class.** A component without dark mode variants is a visual defect in dark-mode environments.

---

## 5. Performance

- **`useMemo` and `useCallback` must be justified** by profiler evidence or structural necessity (passing a stable reference to a `React.memo`-wrapped child). Speculative memoization of cheap values is noise.
- **All `<img>` elements are violations.** `next/image` is mandatory. No exceptions for production code.
- **Components not required on initial render must use `next/dynamic`.** Modal dialogs, drawers, and below-the-fold sections are mandatory candidates.
- **No new dependency added without a documented bundle size justification.** A library introduced for a single utility is a 🟡 Major finding.
- **`useEffect` must not synchronize derived state.** If a value can be computed synchronously from existing state or props, it must not live in `useState` with a synchronizing `useEffect`.
- **Lists rendering 500 or more items unconditionally are a 🔴 Critical performance violation.** Windowing is required.
- **`key={Math.random()}` and `key={Date.now()}` are 🔴 Critical violations.** They invalidate VDOM reconciliation on every render, causing full subtree remounts on every update.

---

## 6. Security

### 6a. Input Sanitization

- **`JSON.parse` of untrusted data must never be spread directly into an object.** Prototype pollution via crafted `__proto__` or `constructor.prototype` keys in parsed JSON is a live attack class. Parse into a validated Zod schema, not directly into application state.
- **URL parameters, search params, and hash values are untrusted input.** Any value read from `useSearchParams`, `useParams`, or `window.location` that reaches rendered output must be treated as user-controlled and validated before use.

### 6b. XSS Prevention
- **`dangerouslySetInnerHTML` without prior DOMPurify sanitization is a 🔴 Critical XSS vulnerability** regardless of the apparent content source. Server-fetched HTML is not safe by virtue of origin.
- **`href` props accepting user-controlled values must validate the URL scheme.** `href="javascript:void(0)"` is a known pattern; `href={userValue}` where `userValue` is unvalidated is an XSS vector. Permitted schemes are `https:` and `http:` only. `javascript:`, `data:`, and `vbscript:` must be rejected.
- **`src` attributes on `<iframe>`, `<embed>`, `<object>`, and dynamic `<script>` tags must not accept user-controlled values.**
- **`target="_blank"` on any `<a>` element without `rel="noopener noreferrer"` is a reverse tabnapping vulnerability.** The opened page gains a reference to the opener via `window.opener` and can redirect it to a phishing page. Every external link must carry `rel="noopener noreferrer"`.
- **`eval()`, `new Function()`, `setTimeout(string)`, and `setInterval(string)` are prohibited.** These execute arbitrary strings as code. No production use case justifies them.
- **Direct DOM manipulation via `element.innerHTML =` outside React's reconciler is a 🔴 Critical violation.** React's renderer escapes content — bypassing it removes that protection entirely.

### 6c. CSRF Protection
- **Next.js Server Actions must validate the `Origin` header** against the application's known origin on every mutating action. A Server Action that accepts POST from any origin is a CSRF vector.
- **API routes accepting state-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) must implement CSRF protection.** Accepted strategies: double-submit cookie pattern, synchronizer token pattern, or strict `SameSite=Strict` cookie configuration verified at the server layer.
- **`SameSite` cookie attribute must be confirmed.** Auth cookies without `SameSite=Strict` or `SameSite=Lax` allow cross-site request forgery through third-party cookie submission. `SameSite=None` without `Secure` is a 🔴 Critical violation.
- **Idempotent `GET` requests must not trigger state mutations.** A `GET` handler that modifies database state is CSRF-vulnerable by definition and violates HTTP semantics simultaneously.

### 6d. Secure Headers (`next.config`)
- **`Content-Security-Policy` must be defined.** The absence of a CSP means the browser will execute any script, load any resource, and allow any frame from any origin. This is the single most impactful XSS mitigation available and its absence is a 🔴 Critical finding.
  - CSP must restrict: `default-src`, `script-src`, `style-src`, `img-src`, `connect-src`, `frame-ancestors`.
  - `script-src 'unsafe-inline'` or `script-src 'unsafe-eval'` in a CSP policy largely defeats the policy's purpose and is a 🟡 Major finding even when a CSP is otherwise present.
- **`X-Frame-Options: DENY` or `SAMEORIGIN` must be set** to prevent the application from being embedded in a third-party `<iframe>` — the prerequisite for clickjacking attacks.
- **`X-Content-Type-Options: nosniff` must be set** to prevent browsers from MIME-sniffing responses away from the declared `Content-Type`, which enables content injection attacks on uploaded files.
- **`Referrer-Policy: strict-origin-when-cross-origin` or stricter must be set** to prevent internal URLs, query parameters, and path structures from leaking in the `Referer` header to third-party origins.
- **`Permissions-Policy` must be defined** to disable browser features not required by the application (camera, microphone, geolocation, payment, USB). An absent `Permissions-Policy` grants third-party scripts access to every available browser API.
- **`Strict-Transport-Security` must be set** for any production deployment served over HTTPS, with `max-age` of at minimum 6 months and `includeSubDomains`.
- **All of the above must be configured in `next.config` as `headers()` entries**, not solely at the CDN or load balancer layer. The application must be self-hardened — infrastructure configuration can be changed or bypassed independently.

### 6e. Cookie Security
- **Auth cookies must carry `HttpOnly`.** A cookie without `HttpOnly` is readable by JavaScript on the page — any XSS vulnerability immediately yields session hijacking.
- **Auth cookies must carry `Secure`.** A cookie without `Secure` is transmitted over unencrypted HTTP connections, exposing the session token to network interception.
- **Auth cookies must carry `SameSite=Strict` or `SameSite=Lax`.** See CSRF section above.
- **Cookie expiry must be intentional and bounded.** A session cookie with no expiry (persists until browser close) and a persistent cookie with a multi-year `max-age` are different security postures with different risk profiles. Both must be explicitly chosen, not defaulted to.

### 6f. General
- **No hardcoded credentials, tokens, API keys, or environment-sensitive URLs** anywhere in the codebase.
- **No sensitive data in `console.log`.** PII, auth tokens, session identifiers, or internal system data in any log output is a compliance and security violation.
- **Third-party scripts must be loaded via `next/script`** with an explicit `strategy`. Unmanaged script injection bypasses CSP controls, introduces uncontrolled execution order, and blocks rendering.
- **`NEXT_PUBLIC_` variables must never contain secrets** (see §20 Environment & Configuration Safety for the full prefix discipline — anything prefixed `NEXT_PUBLIC_` is embedded into the client bundle).
- **Runtime dependency CVEs with critical or high severity rating are 🔴 Critical findings.** Known unaddressed vulnerabilities in production dependencies are not a package hygiene issue — they are a security posture failure.

---

## 7. Testing

- **Every component or hook touching a network resource must have a corresponding MSW handler.**
- **All four states must have explicit assertions:** loading, error, empty, and success. The happy path alone is not test coverage.
- **Tests must assert on observable behavior, not implementation details.** Assertions on internal state values, refs, or component method calls are testing implementation, not contract.
- **Every test must be fully isolated.** Shared mutable state across tests produces non-deterministic results.
- **New features without corresponding test files are incomplete submissions** and should be flagged as 🟡 Major.
- **MSW handlers must simulate adverse conditions:** 500, 404, network timeout, and malformed JSON where the component is expected to handle them.

---

## 8. Code Hygiene

- **No `console.log`, `console.warn`, `console.error`, or `debugger`** committed outside explicitly guarded error-tracking integrations.
- **No commented-out code blocks.** Dead code in comments is confusion. Version control is the history.
- **No `TODO` or `FIXME`** without a linked issue/ticket reference. Unlinked TODOs are permanent.
- **No unused imports, variables, or exports.** Their presence indicates `noUnusedLocals` and `noUnusedParameters` are disabled — a separate critical finding.
- **No `eslint-disable`** without a comment stating the specific reason and a linked issue.
- **No magic strings or numbers repeated more than once.** Constants must be named and centralized.

---

## 9. File & Folder Structure

- **The directory structure must follow a single consistent convention** (feature-based or layer-based) across the entire project. Mixed conventions in the same project are a 🟡 Major structural finding.
- **Tests must be colocated with their source.** A `Button.test.tsx` belongs next to `Button.tsx`, not in a parallel `/tests` tree disconnected from the source.
- **Barrel files must be intentional and minimal.** A barrel re-exporting an entire directory defeats tree-shaking and obscures module boundaries.
- **No cross-domain internal imports.** A feature module importing directly from another feature module's internal files (not through its public barrel) is a boundary violation.
- **Route segment files must live in their correct App Router directory.** A `page.tsx` outside a route group, or a `layout.tsx` applied at the wrong level, is a structural defect.
- **Circular dependencies are 🔴 Critical.** Any import chain forming a cycle must be identified.

---

## 10. Naming Conventions

- **Component files: PascalCase.** `UserCard.tsx` — not `user-card.tsx`, `userCard.tsx`, or `user_card.tsx`.
- **Hook files: camelCase with `use` prefix.** `useAuthStatus.ts` — not `AuthStatus.ts` or `auth-status.ts`.
- **Utility and helper files: camelCase.** `formatDate.ts` — not `FormatDate.ts`.
- **Constant values: UPPER_SNAKE_CASE.** `const MAX_RETRIES = 3` — not `const maxRetries = 3`.
- **Redux action names must follow `domain/verb`.** `auth/loginSuccess` — not `LOGIN_SUCCESS` or `loginSuccess`.
- **Boolean props must use `is`, `has`, or `can` prefixes.** `isDisabled`, `hasError`, `canSubmit`. A boolean prop named `disabled` or `error` loses its semantic signal.
- **Event handler props use `on` prefix; handler implementations use `handle` prefix.** Prop: `onSubmit`. Implementation: `handleSubmit`.
- **Generic type parameters beyond single-letter container types must be descriptive.** `T` for a generic wrapper is acceptable. `T` for a domain-specific type that could be named `TUser` or `TResponse` is not.

---

## 11. Next.js App Router Compliance

- **Every `page.tsx` must export `metadata` or `generateMetadata`** (the metadata requirement and its tag coverage are detailed in §15 SEO & Metadata).
- **`'use client'` must appear at the top of the file, never inside a conditional block.**
- **Server Components must not import modules containing browser APIs** (`window`, `document`, `localStorage`). This causes a Node.js runtime error.
- **`async/await` at the Client Component function level is a 🔴 Critical error** in the current React 19 model. Async Server Components are allowed; async Client Components are not.
- **Every `fetch` in a Server Component must have an explicit cache directive.** Implicit default caching behavior is invisible behavior.
- **`error.tsx` must be present at every route segment capable of throwing.** An uncaught error without a boundary propagates to the root and takes down the entire page.
- **`loading.tsx` must be present** for every route segment with meaningful async data fetching.
- **`not-found.tsx` must be present** at the application root level at minimum.
- **Middleware matchers must be precise.** An overly broad matcher running on `/_next/*` or `/api/health` is a performance penalty on every request.

---

## 12. React-Specific Pitfalls

- **No array index as a `key` prop** in lists where items can be reordered, inserted, or removed. Index keys cause incorrect reconciliation and state retention bugs.
- **`&&` conditional rendering must use a boolean left operand.** `{count && <Component />}` renders the number `0` to the DOM when `count` is zero. The left operand must be explicitly coerced to boolean.
- **No mixing of controlled and uncontrolled inputs.** A component that starts without a `value` prop and later receives one — or vice versa — produces React warnings and undefined behavior.
- **`useRef` must not hold values whose change should trigger a re-render.** Updating a ref does not schedule a re-render; using it where `useState` is correct is a silent reactivity bug.
- **`useLayoutEffect` must be justified.** It runs synchronously after DOM mutation and blocks paint. If `useEffect` achieves the same result, `useLayoutEffect` is incorrect here.
- **Error boundaries must wrap all critical, independently-failing sections.** A missing boundary means a single component error propagates to the nearest parent — which may be the root.
- **No default exports from non-page, non-layout files.** Default exports are silent rename traps. Named exports are refactoring-safe and TypeScript-traceable.

---

## 13. Accessibility (A11y)

- **Interactive elements must be semantic HTML.** `<div onClick>` and `<span onClick>` are violations. `<button>`, `<a>`, and `<input>` provide keyboard access, role inference, and assistive technology support without additional ARIA.
- **ARIA roles must not duplicate the implicit role of the element.** `<button role="button">` is redundant and indicates a misunderstanding of ARIA semantics.
- **Every `<img>` must have an `alt` attribute.** Decorative images use `alt=""`. Informational images must have meaningful, descriptive text. Missing `alt` is a WCAG 2.1 Level A failure.
- **All interactive elements must be keyboard-reachable and operable** via Tab focus, Enter, and Space where appropriate.
- **Modal dialogs must trap focus.** A modal that allows Tab to exit the dialog is inaccessible to keyboard-only users.
- **Form inputs must have associated labels.** `<label htmlFor="id">` linked explicitly, or `aria-label`/`aria-labelledby` on the input. Placeholder text is not a label substitute.
- **Form error messages must be linked to their input via `aria-describedby`.** A visual error message not programmatically associated with its input is invisible to screen readers.
- **Color alone must not convey information.** A red border as the sole error indicator fails users with color vision deficiency.
- **Dynamic content changes must be announced.** Success messages, loading states, and errors rendered dynamically must use `role="alert"`, `role="status"`, or `aria-live` to notify assistive technology.

---

## 14. Form Handling

- **All four form states must have explicit handling:** idle, submitting, error, and success. A form with only a success path is not production-ready.
- **Submit buttons must be disabled during an in-flight submission.** An active submit button during a pending request enables double-submission.
- **All form fields must have Zod validation coverage.** Client-side validation without a schema is ad-hoc and incomplete by design.
- **Forms must reset after a successful submission** unless the UX explicitly requires persistence.
- **Zod schemas must not be defined inline inside component bodies.** Schema definitions belong in dedicated files colocated with their domain type definitions.
- **Field-level error messages must identify the specific failed field.** A generic "an error occurred" without field-level context is insufficient for enterprise forms.

---

## 15. SEO & Metadata

- **Every `page.tsx` must export `metadata` or `generateMetadata`.** A page without metadata is invisible to crawlers and returns blank social previews.
- **OG tags must be present:** `og:title`, `og:description`, `og:image`, `og:url` at minimum.
- **Canonical URLs must be set** for pages accessible through multiple URL paths (query parameters, trailing slashes, paginated routes).
- **`noindex` must be applied to:** auth pages, admin routes, error pages, and routes not intended for public indexing.
- **`next/link` must be used for all internal navigation.** A plain `<a href="/internal">` triggers a full page reload and bypasses client-side routing and prefetching.

---

## 16. CSS & Animation Integrity

- **Animations must only transition `transform` and `opacity`.** Animating `top`, `left`, `width`, `height`, `margin`, or `padding` triggers browser layout recalculation on every frame — a 🔴 Critical performance violation for any animated UI element.
- **z-index must use a named scale.** Ad-hoc values like `z-index: 9999` inline are violations. Tailwind's z-index utilities or project-defined design tokens are the standard.
- **Every breakpoint relevant to a design must be covered.** A component with desktop styles and no responsive variants is a 🟡 Major finding.
- **Overflow behavior must be explicitly defined** for containers receiving dynamic or user-generated content. Undefined overflow on dynamic containers produces unpredictable layout at scale.
- **Dark mode coverage and arbitrary-value tokenization** are governed by §4 (Styling & Class Composition) and apply equally to animated and structural CSS.

---

## 17. i18n Readiness

- **No hardcoded user-facing strings in JSX.** Every string a user reads must be an i18n key reference. In a single-language project today, this is a scale requirement for enterprise systems.
- **Date, time, number, and currency formatting must use locale-aware APIs.** Hardcoded format strings are not locale-safe.
- **Directional Tailwind classes are violations in RTL-compatible layouts.** `ml-`, `mr-`, `pl-`, `pr-`, `left-`, and `right-` are directional. `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-` are logical and RTL-safe.
- **Plural forms must be handled through the i18n system.** Inline ternaries like `count === 1 ? 'item' : 'items'` are not i18n-compliant.

---

## 18. API & Data Boundary Integrity

- **Every API response must be validated with Zod before its data enters state.** An unvalidated response flowing directly into Redux or component state is a runtime type error deferred to whenever the backend changes a field.
- **Concurrent or cancellable requests must use `AbortController`.** A search input firing a new request on each keystroke without cancelling the previous one is a race condition that will serve stale results.
- **Optimistic updates must have a rollback path.** An optimistic update without a rejection handler leaves the UI permanently incorrect on failure.
- **PII must not appear in `console.log`, Redux state, or `localStorage` in plain text.**
- **RTK Query cache tags must not be over-broad.** Invalidating all tags on a single mutation triggers unnecessary refetches across unrelated UI regions.

---

## 19. Dependency & Package Hygiene

- **No unused entries in `package.json`.** A dependency not imported anywhere in the codebase is dead weight in the install chain and audit surface.
- **Every new dependency must have a documented bundle size justification.** A library adding significant gzipped weight for a single utility function is a 🟡 Major finding.
- **`npm audit` must show no critical or high vulnerabilities** in production dependencies. Known unaddressed CVEs are 🔴 Critical findings.
- **License compatibility must be verified.** GPL or AGPL dependencies in a proprietary commercial product are a legal exposure.
- **Version ranges must be intentional.** `*` or open-ended `>=` version specifiers in `package.json` are violations.
- **`devDependencies` must not appear under `dependencies`.** Build or test tools listed under `dependencies` inflate the production bundle.

---

## 20. Environment & Configuration Safety

- **Server-only secrets must not carry the `NEXT_PUBLIC_` prefix.** Anything prefixed `NEXT_PUBLIC_` is statically embedded into the client bundle and visible to every user.
- **Environment variables must be validated at build time** using a Zod schema (or equivalent). An application that starts successfully with missing environment variables and fails at runtime has no build-time safety.
- **`process.env.NODE_ENV` guards must wrap all dev-only code.** Development logging, verbose tracing, and mock initialization must not execute in production.
- **No environment-specific URLs hardcoded in source.** API base URLs, CDN paths, and service endpoints must come from environment variables.

---

# Supplementary Domains (21–25)

The domains above are the stack-wide baseline applicable to any Next.js/React frontend. The domains below are supplementary: cross-cutting concerns that carry monetary, regulatory, privacy, or correctness consequence rather than a purely cosmetic one. They are written as reusable principles, not as rules about any one feature or API.

---

## 21. Monetary & Numeric Integrity

- **Monetary amounts must never be stored or computed as floating-point numbers.** IEEE-754 floats cannot represent decimal currency exactly — `0.1 + 0.2 !== 0.3` is a reconciliation dispute waiting to happen. Use integer minor units or an arbitrary-precision decimal library.
- **Every monetary value must carry an explicit currency.** A bare number rendered as an amount is ambiguous and unsafe in any audit or multi-currency context.
- **Rounding strategy must be explicit and centralized.** Rounding scattered across components via `toFixed` or `Math.round` produces inconsistent totals. The rounding mode must live in a single named utility.
- **The client must not be the source of truth for authoritative financial totals.** Displaying a server-computed value is correct; recomputing a balance, interest, or fee on the client and presenting it as authoritative is a defect.
- **Numeric input must enforce precision, range, and sign at the boundary.** An unbounded, negative, or fractional amount reaching a state-mutating action is a 🔴 Critical correctness violation.

---

## 22. Sensitive Data Handling & Privacy

- **Sensitive identifiers must be masked in the UI by default.** Account numbers, government IDs, and equivalent fields render masked; revealing them is an explicit, deliberate user action — never the default render.
- **No PII or sensitive identifiers in URLs, query strings, `localStorage`, `sessionStorage`, or analytics events.** URLs leak through history, referrer headers, and server logs; web storage is readable by any script on the origin.
- **PII must never appear in plain text in `console.*`, UI-surfaced error messages, or third-party error/analytics payloads.** (Extends §6f and §18 to the privacy boundary.)
- **Data minimization at the component boundary.** A component must receive only the fields it renders. Passing a full customer record to a component that displays one name is over-exposure.
- **Clipboard, autofill, and screenshot exposure of sensitive fields must be intentional.** Auto-copying or auto-filling a sensitive value without explicit user intent is a leakage vector.

---

## 23. Authorization & Access Control (UI Layer)

- **Client-side authorization is a UX affordance, never a security control.** Hiding a button does not protect the action behind it. Every gated action must also be enforced server-side; UI gating presented *as* the security boundary is a 🔴 Critical violation.
- **The UI must not render controls for actions the current user cannot perform.** Surfacing an action that will be rejected server-side is a defect in both UX and least-privilege signalling.
- **Sensitive routes and segments must be guarded at the boundary**, not by conditional rendering deep in the tree where a loading flash can momentarily expose protected content.
- **Role and permission checks must use a single centralized authority.** Ad-hoc `role === 'admin'` comparisons scattered across components drift out of sync and are unmaintainable.
- **Step-up or re-authentication gates for high-impact actions must not be bypassable by client state manipulation.** Whether a verification gate was passed must be confirmed server-side, not trusted from a flag in client state.

---

## 24. Auditability & Traceability

- **High-impact and state-mutating actions must be traceable.** A correlation or request identifier must be propagated with each mutation so a user-initiated action can be reconstructed end to end.
- **Irreversible and financial mutations must carry an idempotency key.** A retried or double-clicked submission without idempotency protection can produce duplicate transactions — a 🔴 Critical violation. (Submission guards in §14 prevent the double-click; idempotency protects against the request that still slips through.)
- **No silent state changes.** Any action altering persisted or financial state must produce an observable, attributable result — not a fire-and-forget call whose failure vanishes.
- **Client-side logs must be structured and queryable** and free of the sensitive payloads enumerated in §22.

---

## 25. Consent, Compliance & High-Impact Confirmation

- **Consent must be captured explicitly, versioned, and recorded before the processing it gates occurs** — never inferred, pre-checked, or bundled with an unrelated agreement.
- **Irreversible or high-impact actions require explicit confirmation that states the consequence.** A single-click path to an unrecoverable financial or data action is a defect.
- **Required legal and regulatory disclosures must be present and programmatically associated** with the action they govern (`aria-describedby` or equivalent) — not relegated to unreachable fine print.
- **Time-sensitive states (expiry, cooling-off, verification windows) must reflect server time, not the client clock.** A countdown driven solely by `Date.now()` is trivially defeated by a wrong client clock.
- **Deadlines and timestamps with legal or financial weight must be displayed unambiguously and timezone-correct.** A due date rendered in the wrong timezone is a compliance and trust failure. (Locale formatting mechanics remain §17.)