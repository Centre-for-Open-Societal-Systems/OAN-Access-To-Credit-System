const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  warn(message: string, ...optionalParams: unknown[]): void {
    if (!isProduction) {
      console.warn(message, ...optionalParams);
    }
  },
  error(message: string, ...optionalParams: unknown[]): void {
    if (!isProduction) {
      console.error(message, ...optionalParams);
    }
    // TODO: Integrate production error reporting tool (e.g. Sentry/Datadog) here
  },
  log(message: string, ...optionalParams: unknown[]): void {
    if (!isProduction) {
      console.log(message, ...optionalParams);
    }
  }
};
