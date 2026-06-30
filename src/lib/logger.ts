const isProduction = process.env.NODE_ENV === 'production';

// Central logging surface. Routing all logs through here gives a single place
// to later forward to an observability platform (Sentry/Datadog) and to redact
// PII before it is emitted — important for a financial app. Errors are always
// emitted (production included) so failures are never silently lost; debug/info
// and warning noise is suppressed in production.
export const logger = {
  warn(message: string, ...optionalParams: unknown[]): void {
    if (!isProduction) {
      console.warn(message, ...optionalParams);
    }
  },
  error(message: string, ...optionalParams: unknown[]): void {
    console.error(message, ...optionalParams);
    // TODO: forward to production error reporting (e.g. Sentry/Datadog) here.
  },
  log(message: string, ...optionalParams: unknown[]): void {
    if (!isProduction) {
      console.log(message, ...optionalParams);
    }
  }
};
