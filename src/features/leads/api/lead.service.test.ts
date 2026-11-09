import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leadService } from './lead.service';

const jsonResponse = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

describe('leadService.getLeads visit details', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('takes visit_date and schedule_status from the lead itself', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          { name: 'LD-0001', status: 'Active', visit_date: '2026-11-20', schedule_status: 'Scheduled' },
          { name: 'LD-0002', status: 'Active', visit_date: null, schedule_status: null },
        ],
        pagination: { total: 2 },
      })
    );

    const { results } = await leadService.getLeads();

    expect(results[0]).toMatchObject({ visitDate: '2026-11-20', scheduleStatus: 'Scheduled' });
    expect(results[1]).toMatchObject({ visitDate: null, scheduleStatus: null });
  });

  it('does not fetch the visit-schedules list, so leads beyond its first 100 keep their visit details', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [{ name: 'LD-0500', status: 'Verified', visit_date: '2026-12-01', schedule_status: 'Completed' }],
        pagination: { total: 500 },
      })
    );

    const { results } = await leadService.getLeads({ start: 480, page_length: 20 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/api/proxy/v1/leads?');
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain('visit-schedules');
    expect(results[0]).toMatchObject({ visitDate: '2026-12-01', scheduleStatus: 'Completed' });
  });

  it('uses the status change time from the backend, falling back to creation', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          { name: 'LD-0006', status: 'Verified', creation: '2026-01-05 08:00:00', status_changed_at: '2026-03-09 14:30:00' },
          { name: 'LD-0007', status: 'Active', creation: '2026-01-06 08:00:00' },
        ],
        pagination: { total: 2 },
      })
    );

    const { results } = await leadService.getLeads();

    expect(results[0]).toMatchObject({ creation: '2026-01-05 08:00:00', statusChangedAt: '2026-03-09 14:30:00' });
    expect(results[1]).toMatchObject({ creation: '2026-01-06 08:00:00', statusChangedAt: null });
  });

  it('keeps the backend status when the latest visit is Missed', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          { name: 'LD-0003', status: 'Verified', visit_date: '2026-11-01', schedule_status: 'Missed' },
          { name: 'LD-0004', status: 'Rejected', visit_date: '2026-11-02', schedule_status: 'Missed' },
          { name: 'LD-0005', status: 'Active', visit_date: '2026-11-03', schedule_status: 'Missed' },
        ],
        pagination: { total: 3 },
      })
    );

    const { results } = await leadService.getLeads();

    expect(results.map((l) => l.status)).toEqual(['Verified', 'Rejected', 'Active']);
    expect(results.every((l) => l.scheduleStatus === 'Missed')).toBe(true);
  });
});
