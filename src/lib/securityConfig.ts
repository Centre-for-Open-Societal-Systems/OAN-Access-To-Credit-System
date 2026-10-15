import securityPolicy from '@/config/security.json';

// Typed accessor for src/config/security.json.
//
// The JSON is imported (not read at runtime) on purpose: the same module resolves
// on the server and in the browser bundle, so the middleware's enforcement and
// the client's idle countdown are guaranteed to be reading the same numbers. A
// runtime-loaded file could only be read on the server, and the client would
// have to be told the values separately — which is exactly how the two drift
// apart and a session gets dropped without warning.

export interface RateLimitRule {
  /** Requests permitted per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

type RateLimitName = keyof typeof securityPolicy.rateLimits & string;

function toRule(name: Exclude<RateLimitName, '_comment'>): RateLimitRule {
  const rule = securityPolicy.rateLimits[name];
  return { limit: rule.limit, windowMs: rule.windowSeconds * 1000 };
}

export const RATE_LIMITS = {
  login: toRule('login'),
  /**
   * Same budget as login: the endpoint verifies the admin-issued temporary
   * password, so it is a credential-guessing surface in its own right.
   */
  setInitialPassword: toRule('setInitialPassword'),
  refresh: toRule('refresh'),
  logout: toRule('logout'),
  heartbeat: toRule('heartbeat'),
  /** Starting an SSO login opens a transaction at IAM, server to server. */
  ssoLogin: toRule('ssoLogin'),
} as const;

const session = securityPolicy.session;

export const SESSION_POLICY = {
  /** Cookie lifetime for a normal sign-in. */
  defaultMaxAgeSeconds: session.defaultMaxAgeSeconds,
  /** Cookie lifetime when "Remember me" was ticked. */
  rememberMeMaxAgeSeconds: session.rememberMeMaxAgeSeconds,
  /**
   * How long a session survives with no activity from the person using it.
   * Enforced server-side by the lifetime of the activity cookie, and mirrored
   * client-side by the idle watcher so the sign-out is not a surprise.
   */
  idleTimeoutSeconds: session.idleTimeoutSeconds,
  /** How long the "you are about to be signed out" warning is shown for. */
  idleWarningSeconds: session.idleWarningSeconds,
  /**
   * Floor on how often genuine activity is reported to the server. Without it,
   * every mouse move would be a network round trip.
   */
  activityPingMinIntervalSeconds: session.activityPingMinIntervalSeconds,
} as const;
