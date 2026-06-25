import { describe, it, expect, vi, beforeEach } from 'vitest';
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
});
