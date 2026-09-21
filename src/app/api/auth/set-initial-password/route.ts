import { AUTH_MESSAGES } from '@/lib/authMessages';
import { getClientIp } from '@/lib/clientIp';
import { checkCsrf } from '@/lib/csrf';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { checkRateLimit, rateLimitedResponse } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/lib/securityConfig';
import { NextResponse } from 'next/server';

/** The `{ status, message, code }` envelope oan_a2c replies with. */
interface Envelope {
  status?: string;
  message?: string;
  code?: string;
}

/**
 * Exchanges an admin-issued temporary password for one only the user knows.
 *
 * This has its own route rather than going through /api/proxy because it
 * *verifies a credential*: `current_password` is checked against the account, so
 * an unthrottled path here is a brute-force oracle for temporary passwords —
 * which are issued by an admin, short, and often reused across a batch of new
 * team members. /api/proxy applies CSRF but no rate limit, which is right for
 * ordinary authenticated traffic and wrong for this.
 *
 * The caller has no session yet by definition (login returned
 * PASSWORD_CHANGE_REQUIRED and deliberately issued no token), so no
 * Authorization header is attached.
 */
export async function POST(request: Request) {
  try {
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;

    const clientIp = getClientIp(request);
    const limit = checkRateLimit(
      `set-initial-password:${clientIp}`,
      RATE_LIMITS.setInitialPassword.limit,
      RATE_LIMITS.setInitialPassword.windowMs
    );
    if (!limit.allowed) {
      logger.security(`Set-initial-password rate limit exceeded for ${clientIp}`);
      return rateLimitedResponse(limit.retryAfterSeconds);
    }

    const body = await request.json().catch(() => null);
    const usr = body?.usr;
    const currentPassword = body?.current_password;
    const newPassword = body?.new_password;

    if (!usr || !currentPassword || !newPassword) {
      return NextResponse.json(
        { message: { status: 'error', message: 'Missing credentials in request' } },
        { status: 400 }
      );
    }

    // X-Forwarded-For carries the derived client IP for the same reason as
    // /api/auth/login: Frappe keys its own limit and attempt tracker off it.
    const response = await fetch(
      `${env.API_BASE_URL}/v1/auth/password/initial`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Forwarded-For': clientIp,
        },
        body: JSON.stringify({ usr, current_password: currentPassword, new_password: newPassword }),
      }
    );

    const data = await response.json().catch(() => null);
    const envelope: Envelope = (data ?? {}) as Envelope;

    if (!response.ok || envelope.status === 'error') {
      logger.security(
        `Set-initial-password rejected for ${clientIp} with status ${response.status}:`,
        envelope.message ?? JSON.stringify(data)
      );

      // Unlike login, the backend's own message is forwarded: the person is
      // already authenticated enough to have been handed a temporary password,
      // so "that temporary password is wrong" and the specific password-policy
      // failure ("must contain a number") are both things they need to read.
      // Only the three envelope fields cross — never `exc`/`_server_messages`.
      const message =
        response.status >= 500
          ? AUTH_MESSAGES.signInUnavailable
          : (envelope.message ?? AUTH_MESSAGES.unexpected);

      return NextResponse.json(
        { message: { status: 'error', message, code: envelope.code } },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    return NextResponse.json({
      message: {
        status: 'success',
        message: envelope.message ?? 'Password set successfully. Please sign in with your new password.',
      },
    });
  } catch (error) {
    logger.error('Set-initial-password proxy error:', error);
    return NextResponse.json(
      { message: { status: 'error', message: AUTH_MESSAGES.signInUnavailable } },
      { status: 500 }
    );
  }
}
