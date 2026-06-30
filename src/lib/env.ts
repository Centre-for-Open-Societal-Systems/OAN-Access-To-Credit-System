// Centralized, eagerly-validated server environment configuration.
//
// Formatted and verified at module load to ensure any missing or invalid
// variable fails immediately with a clear message instead of surfacing
// as an opaque runtime error on the first API request.
const apiBaseUrl = process.env.API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('[env] Missing required environment variable: API_BASE_URL');
}

try {
  new URL(apiBaseUrl);
} catch {
  throw new Error(`[env] Invalid environment configuration: API_BASE_URL must be a valid URL (got "${apiBaseUrl}")`);
}

export const env = {
  API_BASE_URL: apiBaseUrl.replace(/\/+$/, ''),
};
