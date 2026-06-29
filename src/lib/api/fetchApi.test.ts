import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchApi, ApiError } from './fetchApi';

describe('fetchApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully fetch data and return the unwrapped message if present', async () => {
    const mockData = { message: { status: 'success', data: 'test-data' } };
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await fetchApi('test-path', { method: 'POST', body: JSON.stringify({ key: 'value' }) });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3000/api/proxy/api/method/test-path',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
      })
    );
    expect(result).toEqual({ status: 'success', data: 'test-data' });
  });

  it('should return raw responseData if message wrapper is not present', async () => {
    const mockData = { status: 'success', data: 'test-data' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await fetchApi('test-path');
    expect(result).toEqual(mockData);
  });

  it('should throw UNAUTHORIZED when response status is 401', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    await expect(fetchApi('test-path')).rejects.toThrow('UNAUTHORIZED');
  });

  it('should throw FORBIDDEN (not UNAUTHORIZED) when response status is 403', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    } as Response);

    await expect(fetchApi('test-path')).rejects.toThrow('FORBIDDEN');
  });

  it('should throw ApiError with responseData on HTTP error (non-ok response)', async () => {
    const errorResponse = { message: 'Something went wrong' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => errorResponse,
    } as Response);

    try {
      await fetchApi('test-path');
      expect.unreachable('fetchApi should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.message).toBe('Something went wrong');
      expect(apiError.responseData).toEqual(errorResponse);
    }
  });

  it('should throw ApiError with server message if _server_messages is present', async () => {
    const errorResponse = {
      _server_messages: JSON.stringify([JSON.stringify({ message: 'Detailed Server Error' })]),
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => errorResponse,
    } as Response);

    try {
      await fetchApi('test-path');
      expect.unreachable('fetchApi should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.message).toBe('Detailed Server Error');
      expect(apiError.responseData).toEqual(errorResponse);
    }
  });

  it('should throw ApiError when status is 200 OK but application level status is error', async () => {
    const appErrorResponse = {
      message: {
        status: 'error',
        message: 'Application level validation failed',
      },
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => appErrorResponse,
    } as Response);

    try {
      await fetchApi('test-path');
      expect.unreachable('fetchApi should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.message).toBe('Application level validation failed');
      expect(apiError.responseData).toEqual(appErrorResponse);
    }
  });

  describe('with window defined (browser environment)', () => {
    beforeEach(() => {
      vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should attempt to refresh token on 401 and retry the request on success', async () => {
      let fetchCount = 0;
      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes('/api/auth/refresh')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ success: true }),
          } as Response;
        }
        
        fetchCount++;
        if (fetchCount === 1) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ message: 'Session expired' }),
          } as Response;
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({ message: { status: 'success', data: 'retry-success' } }),
        } as Response;
      });

      const result = await fetchApi('test-path');

      expect(fetchSpy).toHaveBeenCalledTimes(3); // 1st try (401), refresh, 2nd try (success)
      expect(result).toEqual({ status: 'success', data: 'retry-success' });
    });

    it('should queue concurrent 401 requests and only call refresh once', async () => {
      let refreshCalls = 0;
      let resolveRefresh: (value: Response) => void;
      const refreshPromise = new Promise<Response>((resolve) => {
        resolveRefresh = resolve;
      });

      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes('/api/auth/refresh')) {
          refreshCalls++;
          return refreshPromise;
        }
        return {
          ok: false,
          status: 401,
          json: async () => ({ message: 'Session expired' }),
        } as Response;
      });

      // Trigger two concurrent fetchApi calls
      const p1 = fetchApi('path-1');
      const p2 = fetchApi('path-2');

      // Allow microtasks to execute so they hit the 401 and wait on refreshPromise
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Resolve the refresh promise
      resolveRefresh!({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response);

      // Now update the mock so retry requests succeed
      fetchSpy.mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes('/api/auth/refresh')) {
          return { ok: true, status: 200, json: async () => ({}) } as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ message: 'success' }),
        } as Response;
      });

      const [r1, r2] = await Promise.all([p1, p2]);

      expect(refreshCalls).toBe(1); // Only one call to /api/auth/refresh
      expect(r1).toBe('success');
      expect(r2).toBe('success');
    });

    it('should propagate UNAUTHORIZED if token refresh fails', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes('/api/auth/refresh')) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ message: 'Invalid refresh token' }),
          } as Response;
        }
        return {
          ok: false,
          status: 401,
          json: async () => ({ message: 'Session expired' }),
        } as Response;
      });

      await expect(fetchApi('test-path')).rejects.toThrow('UNAUTHORIZED');
      expect(fetchSpy).toHaveBeenCalledTimes(2); // 1st try (401), refresh (401)
    });
  });
});

