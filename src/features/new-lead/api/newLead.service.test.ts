import { describe, it, expect, vi } from 'vitest';
import { newLeadService } from './newLead.service';
import { fetchApi } from '@/lib/api/fetchApi';

// Mock the fetchApi utility
vi.mock('@/lib/api/fetchApi', () => ({
  fetchApi: vi.fn(),
}));

describe('newLeadService.createLead', () => {
  it('should call fetchApi with the correct path and post body', async () => {
    const payload = {
      phone_number: '1234567890',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      lead_source: 'Agent Entry',
      external_id: 'FID-12345',
    };

    const mockResponse = {
      status: 'success',
      lead_id: '#LD-99999',
      message: 'Lead created successfully.',
    };

    vi.mocked(fetchApi).mockResolvedValue(mockResponse);

    const result = await newLeadService.createLead(payload);

    expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.create_lead', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(mockResponse);
  });
});
