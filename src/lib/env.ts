// Centralized server environment configuration.
// Validation runs on first access (not at module load) so `next build` can
// collect page data without the URL present. At runtime the first API request
// will throw immediately with a clear message if the variable is missing.
export const env = {
  get API_BASE_URL(): string {
    const val = process.env.API_BASE_URL;
    if (!val) {
      throw new Error('[env] Missing required environment variable: API_BASE_URL');
    }
    try {
      new URL(val);
    } catch {
      throw new Error(`[env] Invalid environment configuration: API_BASE_URL must be a valid URL (got "${val}")`);
    }
    return val.replace(/\/+$/, '');
  },

  /**
   * The OpenG2P IAM service Development Agents sign in through (SSO). Optional:
   * when `IAM_BASE_URL` is unset the SSO button sends people back with
   * `staff_unavailable`. Server-only — the browser never learns IAM's address;
   * every IAM call goes through `src/lib/iamSession.ts`.
   *
   * `application` must equal oan_auth_service's `iam_application`: it names the
   * client whose roles (`resource_access[application].roles`) the backend syncs
   * onto the local user, so routing here reads the same list. `cookieDomain`
   * must equal IAM's `*_AUTH_COOKIE_DOMAIN`, or the cookies this app expires
   * when IAM refuses to renew a session are different cookies from IAM's.
   */
  get IAM(): {
    baseUrl: string;
    loginProviderId: string;
    application: string;
    cookiePrefix: string;
    cookieDomain: string | undefined;
  } | null {
    const baseUrl = process.env.IAM_BASE_URL;
    if (!baseUrl) return null;
    try {
      new URL(baseUrl);
    } catch {
      throw new Error(`[env] Invalid environment configuration: IAM_BASE_URL must be a valid URL (got "${baseUrl}")`);
    }
    const loginProviderId = process.env.IAM_LOGIN_PROVIDER_ID;
    const application = process.env.IAM_APPLICATION;
    if (!loginProviderId || !application) {
      throw new Error('[env] IAM_BASE_URL is set, so IAM_LOGIN_PROVIDER_ID and IAM_APPLICATION are required');
    }
    return {
      baseUrl: baseUrl.replace(/\/+$/, ''),
      loginProviderId,
      application,
      cookiePrefix: process.env.IAM_COOKIE_PREFIX ?? '',
      cookieDomain: process.env.IAM_COOKIE_DOMAIN || undefined,
    };
  },
};
