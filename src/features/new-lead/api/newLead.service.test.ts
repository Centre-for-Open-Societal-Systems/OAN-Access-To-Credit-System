import { describe, it, expect, vi, beforeEach } from 'vitest';
import { newLeadService } from './newLead.service';
import { fetchApi } from '@/lib/api/fetchApi';

vi.mock('@/lib/api/fetchApi', () => ({
  fetchApi: vi.fn(),
}));

describe('newLeadService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('searchFarmer', () => {
    it('should successfully search and map farmer details when farmer field is present', async () => {
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: {
          status: 'success',
          farmer: {
            name: 'John Doe',
            phone: '1234567890',
            email: 'john@example.com',
            location: 'Kerala',
          },
        },
      });

      const result = await newLeadService.searchFarmer('FID-123');
      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        email: 'john@example.com',
        location: 'Kerala',
        gender: '',
      });
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.consent.api.search_farmer', {
        method: 'POST',
        body: JSON.stringify({ fayda_id: 'FID-123' }),
      });
    });

    it('should successfully search and map farmer details when flattened payload is returned', async () => {
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: {
          name: 'Jane Smith Doe',
          phone: '9876543210',
          email: 'jane@example.com',
          location: 'Delhi',
        },
      });

      const result = await newLeadService.searchFarmer('FID-456');
      expect(result).toEqual({
        firstName: 'Jane',
        lastName: 'Smith Doe',
        phoneNumber: '9876543210',
        email: 'jane@example.com',
        location: 'Delhi',
        gender: '',
      });
    });

    it('should throw an error when API response data is null', async () => {
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: null,
      });

      await expect(newLeadService.searchFarmer('FID-UNKNOWN'))
        .rejects.toThrow("Farmer with Fayda ID 'FID-UNKNOWN' not found.");
    });

    it('should throw an error when farmer is not found (status is not success and no valid fields)', async () => {
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: {
          status: 'failed',
        },
      });

      await expect(newLeadService.searchFarmer('FID-FAILED'))
        .rejects.toThrow("Farmer with Fayda ID 'FID-FAILED' not found.");
    });

    it('should propagate error when fetchApi rejects', async () => {
      const apiError = new Error('Network error');
      vi.mocked(fetchApi).mockRejectedValue(apiError);

      await expect(newLeadService.searchFarmer('FID-123'))
        .rejects.toThrow('Network error');
    });
  });

  describe('sendOtpAndCreateConsent', () => {
    it('should call OTP api and return data', async () => {
      const mockConsent = {
        consent_request: 'REQ-123',
        transaction_id: 'TX-999',
        masked_phone: '******7890',
      };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockConsent,
      });

      const result = await newLeadService.sendOtpAndCreateConsent({
        farmerId: 'FID-123',
        consentFormFilename: 'consent.pdf',
        consentFormBase64: 'base64str',
        leadId: 'LD-12345',
      });

      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.consent.api.request_otp', {
        method: 'POST',
        body: JSON.stringify({
          lead_id: 'LD-12345',
          fayda_id: 'FID-123',
          partner: 'AgriBank',
          purpose: 'Loan for seeds and fertilizer',
          consent_form_filename: 'consent.pdf',
          consent_form_base64: 'base64str',
        }),
      });
      expect(result).toEqual(mockConsent);
    });

    it('should propagate error when fetchApi fails', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('OTP service down'));

      await expect(
        newLeadService.sendOtpAndCreateConsent({
          farmerId: 'FID-123',
          consentFormFilename: 'consent.pdf',
          consentFormBase64: 'base64str',
        })
      ).rejects.toThrow('OTP service down');
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and return consent details', async () => {
      const mockVerifyResponse = {
        consent_request: 'REQ-123',
        openg2p_consent_id: 'G2P-456',
        consent_receipt: 'REC-789',
        status: 'Granted',
      };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockVerifyResponse,
      });

      const result = await newLeadService.verifyOtp({
        leadId: 'LD-12345',
        otp_code: '123456',
      });

      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.consent.api.verify_otp_for_lead', {
        method: 'POST',
        body: JSON.stringify({
          lead_id: 'LD-12345',
          otp_code: '123456',
        }),
      });
      expect(result).toEqual(mockVerifyResponse);
    });

    it('should throw an error when leadId is missing', async () => {
      await expect(
        newLeadService.verifyOtp({
          otp_code: '123456',
        })
      ).rejects.toThrow('leadId is required for OTP verification');
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Invalid OTP code'));

      await expect(
        newLeadService.verifyOtp({
          leadId: 'LD-123',
          otp_code: '000000',
        })
      ).rejects.toThrow('Invalid OTP code');
    });
  });

  describe('getLeadDetails', () => {
    it('should return mapped farmer details on success', async () => {
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: {
          first_name: 'Alice',
          last_name: 'Smith',
          phone_number: '5555555555',
          location: 'Ambo',
          email: 'alice@example.com',
          gender: 'Female',
        },
      });

      const result = await newLeadService.getLeadDetails('LD-55555');
      expect(result).toEqual({
        firstName: 'Alice',
        lastName: 'Smith',
        phoneNumber: '5555555555',
        location: 'Ambo',
        email: 'alice@example.com',
        gender: 'Female',
      });
    });

    it('should return empty fields if response data is null', async () => {
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: null,
      });

      const result = await newLeadService.getLeadDetails('LD-EMPTY');
      expect(result).toEqual({
        firstName: '',
        lastName: '',
        location: '',
        phoneNumber: '',
        email: '',
        gender: '',
      });
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Database offline'));

      await expect(newLeadService.getLeadDetails('LD-ERR'))
        .rejects.toThrow('Database offline');
    });
  });

  describe('createLead', () => {
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

      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        message: 'Lead created successfully.',
        data: mockResponse,
      });

      const result = await newLeadService.createLead(payload);

      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.create_lead', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Internal server error'));

      const payload = {
        phone_number: '1234567890',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        lead_source: 'Agent Entry',
      };

      await expect(newLeadService.createLead(payload))
        .rejects.toThrow('Internal server error');
    });
  });

  describe('updateLeadStatus', () => {
    it('should call status API and return confirmation on success', async () => {
      const mockResponse = {
        lead_id: 'LD-123',
        new_status: 'Processed',
      };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockResponse,
      });

      const result = await newLeadService.updateLeadStatus({
        lead_id: 'LD-123',
        status: 'Processed',
        reason: 'Checks passed',
      });

      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.update_lead_status', {
        method: 'POST',
        body: JSON.stringify({
          lead_id: 'LD-123',
          status: 'Processed',
          reason: 'Checks passed',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Transition disallowed'));

      await expect(
        newLeadService.updateLeadStatus({
          lead_id: 'LD-123',
          status: 'Rejected',
        })
      ).rejects.toThrow('Transition disallowed');
    });
  });

  describe('getSpecificLead', () => {
    it('should fetch and map specific lead details on success', async () => {
      const mockLeads = [
        {
          name: 'LD-NAME',
          status: 'Prospect',
          lead_source: 'Walk-in',
          assigned_to: 'agent@oan.com',
        },
      ];
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockLeads,
      });

      const result = await newLeadService.getSpecificLead('LD-123');
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.get_leads?search_query=LD-123');
      expect(result).toEqual([
        {
          lead_id: 'LD-NAME',
          status: 'Prospect',
          lead_source: 'Walk-in',
          assigned_to: 'agent@oan.com',
        },
      ]);
    });

    it('should return empty list if response data is null or undefined', async () => {
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: null,
      });

      const result = await newLeadService.getSpecificLead('LD-123');
      expect(result).toEqual([]);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('API failure'));
      await expect(newLeadService.getSpecificLead('LD-123')).rejects.toThrow('API failure');
    });
  });

  describe('getCreditInfo', () => {
    it('should fetch and return credit info on success', async () => {
      const mockCreditInfo = [
        {
          name: 'CI-1',
          loan_type: 'Seed Loan',
          loan_amount: 5000,
          purpose_message: 'Seeds and ferts',
        },
      ];
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockCreditInfo,
      });

      const result = await newLeadService.getCreditInfo('LD-123');
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.get_lead_credit_infos?lead_id=LD-123');
      expect(result).toEqual(mockCreditInfo);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Credit check failed'));
      await expect(newLeadService.getCreditInfo('LD-123')).rejects.toThrow('Credit check failed');
    });
  });

  describe('addCreditInfo', () => {
    it('should call fetchApi and return confirmation on success', async () => {
      const payload = {
        lead_id: 'LD-123',
        loan_type: 'Tractor Loan',
        loan_amount: 150000,
        purpose_message: 'Buying a tractor',
      };
      const mockResponse = { credit_info_id: 'CI-999' };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockResponse,
      });

      const result = await newLeadService.addCreditInfo(payload);
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.add_lead_credit_info', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Failed to save credit info'));
      await expect(
        newLeadService.addCreditInfo({
          lead_id: 'LD-123',
          loan_type: 'Tractor',
          loan_amount: 100,
        })
      ).rejects.toThrow('Failed to save credit info');
    });
  });

  describe('getCallDetails', () => {
    it('should fetch and return call logs on success', async () => {
      const mockResponse = {
        lead_id: 'LD-123',
        call_logs: [
          {
            source: 'Manual Dial',
            ref_id: 'REF-1',
            timestamp: '2026-06-14T12:00:00Z',
          },
        ],
      };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockResponse,
      });

      const result = await newLeadService.getCallDetails('LD-123');
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.get_lead_call_logs?lead_id=LD-123');
      expect(result).toEqual(mockResponse);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Failed to fetch call details'));
      await expect(newLeadService.getCallDetails('LD-123')).rejects.toThrow('Failed to fetch call details');
    });
  });

  describe('getActivities', () => {
    it('should fetch and return activity logs on success', async () => {
      const mockResponse = {
        lead_id: 'LD-123',
        timeline: [
          {
            name: 'ACT-1',
            event_type: 'Status Changed',
            event_title: 'Lead Promoted',
            event_description: 'Lead was promoted to Prospect',
            creation: '2026-06-14T12:00:00Z',
            owner: 'system',
          },
        ],
      };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockResponse,
      });

      const result = await newLeadService.getActivities('LD-123');
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.get_lead_timeline?lead_id=LD-123');
      expect(result).toEqual(mockResponse);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Failed to fetch timeline'));
      await expect(newLeadService.getActivities('LD-123')).rejects.toThrow('Failed to fetch timeline');
    });
  });

  describe('addActivityNote', () => {
    it('should successfully add note for an existing lead', async () => {
      const mockResponse = { comment_id: 'COMM-123' };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockResponse,
      });

      const result = await newLeadService.addActivityNote({
        leadId: 'LD-123',
        content: 'Verification complete',
      });
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.add_lead_comment', {
        method: 'POST',
        body: JSON.stringify({ lead_id: 'LD-123', content: 'Verification complete' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should mock note creation immediately if lead ID is "new"', async () => {
      const result = await newLeadService.addActivityNote({
        leadId: 'new',
        content: 'Offline note',
      });
      expect(fetchApi).not.toHaveBeenCalled();
      expect(result.comment_id).toContain('new-');
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Failed to save comment'));
      await expect(
        newLeadService.addActivityNote({
          leadId: 'LD-123',
          content: 'Test note',
        })
      ).rejects.toThrow('Failed to save comment');
    });
  });

  describe('scheduleVisit', () => {
    it('should call fetchApi and return confirmation on success', async () => {
      const payload = {
        lead_id: 'LD-123',
        visit_date: '2026-06-15',
        visit_time: '10:00:00',
        region: 'Amhara',
        zone: 'North Gondar',
        woreda: 'Gondar Zuria',
        kebele: 'Kebele 01',
        meeting_location: 'Farm site',
        notes: 'Bring documentation',
      };
      const mockResponse = { schedule_id: 'SCHED-555' };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockResponse,
      });

      const result = await newLeadService.scheduleVisit(payload);
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.schedule_visit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Failed to schedule visit'));
      await expect(
        newLeadService.scheduleVisit({
          lead_id: 'LD-123',
          visit_date: '2026-06-15',
          visit_time: '10:00:00',
          region: 'R1',
          zone: 'Z1',
          woreda: 'W1',
          kebele: 'K1',
          meeting_location: 'L1',
          notes: 'N1',
        })
      ).rejects.toThrow('Failed to schedule visit');
    });
  });

  describe('getVisitSchedules', () => {
    it('should fetch and return visit schedules on success', async () => {
      const mockResponse = [
        {
          name: 'SCHED-1',
          visit_date: '2026-06-15',
          visit_time: '10:00:00',
          meeting_location: 'Office',
        },
      ];
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockResponse,
      });

      const result = await newLeadService.getVisitSchedules('LD-123');
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.get_visit_schedules?lead_id=LD-123&start=0&page_length=50');
      expect(result).toEqual(mockResponse);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Failed to fetch schedules'));
      await expect(newLeadService.getVisitSchedules('LD-123')).rejects.toThrow('Failed to fetch schedules');
    });
  });

  describe('updateVisitScheduleStatus', () => {
    it('should call status update API and return confirmation on success', async () => {
      const payload = { schedule_id: 'SCHED-1', status: 'Completed' };
      const mockResponse = { schedule_id: 'SCHED-1', new_status: 'Completed' };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockResponse,
      });

      const result = await newLeadService.updateVisitScheduleStatus(payload);
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.update_visit_schedule_status', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Failed to update visit status'));
      await expect(
        newLeadService.updateVisitScheduleStatus({
          schedule_id: 'SCHED-1',
          status: 'Cancelled',
        })
      ).rejects.toThrow('Failed to update visit status');
    });
  });

  describe('getAssignableUsers', () => {
    it('should fetch and return assignable users on success', async () => {
      const mockResponse = [
        {
          email: 'agent@oan.com',
          full_name: 'Agent User',
          agent_id: 'AG-1',
          region: 'Oromia',
        },
      ];
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockResponse,
      });

      const result = await newLeadService.getAssignableUsers('agent');
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.get_assignable_users?search_query=agent');
      expect(result).toEqual(mockResponse);
    });

    it('should return empty list if response data is null or undefined', async () => {
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: null,
      });

      const result = await newLeadService.getAssignableUsers('query');
      expect(result).toEqual([]);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Failed to fetch assignable users'));
      await expect(newLeadService.getAssignableUsers('query')).rejects.toThrow('Failed to fetch assignable users');
    });
  });

  describe('assignLead', () => {
    it('should call assign API and return payload and response mapping on success', async () => {
      const input = {
        leadId: 'LD-123',
        assigneeName: 'Agent User',
        email: 'agent@oan.com',
        region: 'Oromia',
      };
      const mockBackendResponse = {
        lead_id: 'LD-123',
        assigned_to: 'agent@oan.com',
        assigned_date: '2026-06-14',
      };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockBackendResponse,
      });

      const result = await newLeadService.assignLead(input);
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.assign_lead', {
        method: 'POST',
        body: JSON.stringify({
          lead_id: 'LD-123',
          assigned_to: 'agent@oan.com',
        }),
      });
      expect(result.response).toEqual(mockBackendResponse);
      expect(result.payload.assigneeName).toBe('Agent User');
      expect(result.payload.region).toBe('Oromia');
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Failed to assign lead'));
      await expect(
        newLeadService.assignLead({
          leadId: 'LD-123',
          assigneeName: 'Agent',
          email: 'agent@oan.com',
        })
      ).rejects.toThrow('Failed to assign lead');
    });
  });

  describe('getLeadMetadata', () => {
    it('should fetch and return metadata on success', async () => {
      const mockResponse = {
        statuses: ['New', 'Prospect'],
        sources: ['Walk-in'],
        loan_types: ['Seed'],
      };
      vi.mocked(fetchApi).mockResolvedValue({
        status: 'success',
        data: mockResponse,
      });

      const result = await newLeadService.getLeadMetadata();
      expect(fetchApi).toHaveBeenCalledWith('oan_a2c.api.v1.leads.get_lead_metadata');
      expect(result).toEqual(mockResponse);
    });

    it('should propagate error when fetchApi rejects', async () => {
      vi.mocked(fetchApi).mockRejectedValue(new Error('Failed to fetch metadata'));
      await expect(newLeadService.getLeadMetadata()).rejects.toThrow('Failed to fetch metadata');
    });
  });
});

