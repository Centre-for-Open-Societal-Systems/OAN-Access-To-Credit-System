import { http, HttpResponse } from 'msw';
import { DUMMY_LOANS, getFallbackMockRows } from './loans.mock';
import { leadRows } from './leads.mock';

export const handlers = [
  http.get('/api/loans', () => {
    return HttpResponse.json(DUMMY_LOANS);
  }),

  http.get('/api/loans/:id', ({ params }) => {
    const loan = DUMMY_LOANS.find(l => l.id === params.id);
    if (!loan) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(loan);
  }),

  http.put('/api/loans/:id/status', async ({ params, request }) => {
    const body = await request.json() as { status: string };
    const loan = DUMMY_LOANS.find(l => l.id === params.id);
    if (!loan) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ ...loan, status: body.status, updated: new Date().toISOString() });
  }),

  http.post('/api/loans', async ({ request }) => {
    const body = await request.json() as any;
    const newLoan = {
      id: `APP-2024-${Math.floor(Math.random() * 9000) + 1000}`,
      applicant: body.fullName || 'New Applicant',
      type: body.loanType || 'Input Financing',
      status: 'Draft',
      statusTone: 'neutral',
      updated: 'Just now',
      amount: body.requestedAmount || '0.00',
      phone: body.mobilePhone || '',
      region: body.region || '',
      loanTerm: body.loanDuration || '12 Months',
      formData: body
    };
    return HttpResponse.json(newLoan, { status: 201 });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.api.v1.leads.get_leads', ({ request }) => {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search_query')?.toLowerCase() || '';
    const statusQuery = url.searchParams.get('status') || '';

    let filteredRows = leadRows;

    // Apply Status Filter
    if (statusQuery) {
      const statuses = statusQuery.split(',');
      filteredRows = filteredRows.filter(row => statuses.includes(row.status));
    }

    // Apply Search Filter
    if (searchQuery) {
      filteredRows = filteredRows.filter(row => 
        row.id.toLowerCase().includes(searchQuery) ||
        row.phone.includes(searchQuery) ||
        (row.location && row.location.toLowerCase().includes(searchQuery))
      );
    }

    // Map the mock format to the Frappe backend format expected by lead.service.ts
    const mappedResults = filteredRows.map((row: any) => ({
      ...row,
      name: row.id,
      farmer_name: row.farmerName,
      farmer_id: row.farmerId,
      consent_date: row.consentDate,
      phone_number: row.phone,
      loan_type: row.loanType || '', 
      loan_amount: row.loanAmount || '',
      lead_source: row.source,
      assigned_to: row.owner === 'me' ? 'me' : row.owner === 'other' ? 'someone' : null,
      creation: row.callStartTime,
    }));

    return HttpResponse.json({
      message: {
        results: mappedResults,
        total_count: mappedResults.length
      }
    });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.api.v1.leads.get_lead_summary', () => {
    // Dynamically calculate the summary based on the mock data
    const by_status = leadRows.reduce((acc: any, lead: any) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    return HttpResponse.json({
      message: {
        total: leadRows.length,
        by_status
      }
    });
  }),

  http.post('*/api/proxy/api/method/oan_a2c.api.v1.leads.create_lead', async () => {
    return HttpResponse.json({
      message: {
        status: 'success',
        lead_id: 'LEAD-2026-00022',
        message: 'Lead created successfully.'
      }
    });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.api.v1.loan_applications.get_all_loans', ({ request }) => {
    const url = new URL(request.url);
    const leadIdQuery = url.searchParams.get('lead_id');
    const pageSize = parseInt(url.searchParams.get('page_size') || '10', 10);

    if (leadIdQuery) {
      if (leadIdQuery === 'TEST_LEAD_999') {
        return HttpResponse.json({
          message: {
            status: "success",
            results: [],
            total: 0,
            page: 1,
            page_size: pageSize
          }
        });
      }

      return HttpResponse.json({
        message: {
          status: "success",
          results: [
            {
              application_id: `APP-2026-03538`,
              status: "Draft",
              step: 1,
              lead_id: leadIdQuery,
              loan_amount: 312043.42,
              loan_type: "Land loan",
              location: "Somali, Jigjiga",
              phone_number: "+251962959859",
              creation: "2026-06-09 17:43:35.892144"
            }
          ],
          total: 1,
          page: 1,
          page_size: pageSize
        }
      });
    }

    const searchQuery = url.searchParams.get('search_query')?.toLowerCase() || '';
    const statusQuery = url.searchParams.get('status') || '';
    const locationQuery = url.searchParams.get('location')?.toLowerCase() || '';
    const loanTypeQuery = url.searchParams.get('loan_type') || '';
    const amountMin = url.searchParams.get('loan_amount_min');
    const amountMax = url.searchParams.get('loan_amount_max');
    const fromDate = url.searchParams.get('from_date');
    const toDate = url.searchParams.get('to_date');
    const tab = url.searchParams.get('tab') || 'all';
    
    // Pagination params
    const page = parseInt(url.searchParams.get('page') || '1', 10);

    let filteredRows = getFallbackMockRows();

    if (searchQuery) {
      filteredRows = filteredRows.filter((r: any) => 
        (r.id && r.id.toLowerCase().includes(searchQuery)) || 
        (r.phone && r.phone.toLowerCase().includes(searchQuery)) || 
        (r.applicant && r.applicant.toLowerCase().includes(searchQuery))
      );
    }

    if (statusQuery && statusQuery !== '["__NONE__"]') {
      try {
        const statuses = JSON.parse(statusQuery);
        if (statuses.length > 0 && statuses[0] !== '__NONE__') {
          filteredRows = filteredRows.filter((r: any) => statuses.includes(r.status));
        }
      } catch (e) {
        filteredRows = filteredRows.filter((r: any) => r.status === statusQuery);
      }
    } else if (statusQuery === '["__NONE__"]') {
       filteredRows = [];
    }

    if (loanTypeQuery) {
      try {
        const types = JSON.parse(loanTypeQuery);
        if (types.length > 0) {
          filteredRows = filteredRows.filter((r: any) => types.includes(r.type));
        }
      } catch (e) {}
    }

    if (locationQuery) {
      filteredRows = filteredRows.filter((r: any) => 
        (r.applicant && r.applicant.toLowerCase().includes(locationQuery)) ||
        (r.region && r.region.toLowerCase().includes(locationQuery))
      );
    }

    if (amountMin) {
      filteredRows = filteredRows.filter((r: any) => {
        if (!r.loanAmount) return false;
        const numVal = parseInt(r.loanAmount.replace(/[^0-9]/g, ''), 10);
        const minVal = parseInt(amountMin, 10);
        const maxVal = amountMax ? parseInt(amountMax, 10) : Infinity;
        return numVal >= minVal && numVal <= maxVal;
      });
    }

    if (fromDate || toDate) {
      const fromTime = fromDate ? new Date(fromDate).getTime() : 0;
      const toTime = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : Infinity;
      filteredRows = filteredRows.filter((r: any) => {
        const dStr = r.updated ? r.updated.split(' · ')[0] : null;
        if (!dStr) return false;
        const rTime = new Date(dStr).getTime();
        return rTime >= fromTime && rTime <= toTime;
      });
    }

    if (tab === 'my') {
      filteredRows = filteredRows.slice(0, 12);
    } else if (tab === 'unassigned') {
      filteredRows = filteredRows.slice(0, 15);
    }

    const totalCount = filteredRows.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize);

    // Map paginatedRows to the new backend format so UI can parse it correctly
    const mappedRows = paginatedRows.map((r: any) => ({
      application_id: r.id,
      first_name: r.applicant?.split(' ')[0] || '',
      last_name: r.applicant?.split(' ').slice(1).join(' ') || '',
      phone_number: r.phone,
      status: r.status,
      loan_amount: parseFloat((r.loanAmount || '0').replace(/[^0-9.]/g, '')),
      loan_type: r.type,
      location: r.region,
      creation: new Date().toISOString().replace('T', ' ').slice(0, 26) // Mock creation time
    }));

    return HttpResponse.json({
      message: {
        status: "success",
        results: mappedRows,
        total: totalCount,
        page,
        page_size: pageSize
      }
    });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.api.v1.loan_applications.get_loan_summary', () => {
    const allRows = getFallbackMockRows();
    const summary = allRows.reduce((acc: any, row: any) => {
      acc.total = (acc.total || 0) + 1;
      
      const s = row.status.toLowerCase();
      if (s === 'approved') acc.approved = (acc.approved || 0) + 1;
      else if (s === 'rejected') acc.rejected = (acc.rejected || 0) + 1;
      else acc.processing = (acc.processing || 0) + 1; // Draft, Pending Review, Processing, etc.
      
      return acc;
    }, { total: 0, approved: 0, processing: 0, rejected: 0 });

    summary.tab_counts = {
      all: summary.total,
      my: 12,
      unassigned: 15
    };

    return HttpResponse.json({
      message: {
        status: "success",
        summary
      }
    });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.api.v1.loan_applications.get_basic_profile', ({ request }) => {
    return HttpResponse.json({
      message: {
        status: "success",
        data: {
          first_name: "Pending",
          last_name: "Pending",
          phone_number: "+251999999999",
          email: null,
          location: null
        }
      }
    });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.api.v1.loan_applications.get_full_profile', ({ request }) => {
    const url = new URL(request.url);
    const appId = url.searchParams.get('application_id') || 'APP-2026-00083';
    return HttpResponse.json({
      message: {
        status: "success",
        data: {
          name: appId,
          owner: "Administrator",
          creation: new Date().toISOString(),
          modified: new Date().toISOString(),
          modified_by: "admin@example.com",
          docstatus: 0,
          idx: 0,
          lead_id: null,
          farmer_id: null,
          first_name: "Pending",
          last_name: "Pending",
          phone_number: "+251999999999",
          email: null,
          location: null,
          date_of_birth: null,
          gender: "",
          marital_status: "",
          size_of_family: 0,
          number_of_children: 0,
          no_of_females_family: 0,
          no_of_males_family: 0,
          source_of_income: null,
          education_level: "",
          family_member_owns_land_independently: 0,
          total_farmland_size_as_landowner: 0.0,
          total_farmland_size_as_crop_sharing: 0.0,
          total_farmland_size_as_rented: 0.0,
          farmland_size_hectares: 0.0,
          land_ownership_status: null,
          soil_fertility_minerals: null,
          moisture_levels: null,
          certification_id: null,
          certification_photo_url: null,
          consent_id: null,
          loan_amount: 50000.0,
          loan_type: "Input Loan",
          loan_reason: "Buy fertilizer and seeds",
          duration: "12 Months",
          primary_crops: "Wheat, Barley",
          crop_variety: "Local",
          expected_yield: 25,
          bank_account_no: "1000123456789",
          ifsc_code: "COOPETAA",
          bank_name: "Cooperative Bank of Oromia",
          account_holder: "Yosef Tekle",
          doctype: "A2C Loan Application"
        }
      }
    });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.api.v1.loan_applications.get_credit_info', ({ request }) => {
    return HttpResponse.json({
      message: {
        status: "success",
        data: {
          loan_amount: 50000.0,
          loan_type: "Input Loan",
          loan_reason: null,
          status: "Under Review"
        }
      }
    });
  }),

  http.post('*/api/proxy/api/method/oan_a2c.api.v1.loan_applications.edit_credit_info', () => {
    return HttpResponse.json({
      message: {
        status: "success",
        message: "Credit info updated successfully"
      }
    });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.api.v1.loan_applications.get_supporting_documents', () => {
    return HttpResponse.json({
      message: {
        status: "success",
        files: []
      }
    });
  }),

  http.post('*/api/proxy/api/method/oan_a2c.api.v1.loan_applications.upload_supporting_documents', () => {
    return HttpResponse.json({
      message: {
        status: "success",
        message: "Document uploaded successfully"
      }
    });
  }),

  http.post('*/api/proxy/api/method/oan_a2c.api.v1.loan_applications.update_loan_step', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      message: {
        status: "success",
        message: `Loan application step updated to ${data.step}`
      }
    });
  }),

  http.post('*/api/proxy/api/method/oan_a2c.api.v1.leads.update_lead_status', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      message: {
        status: "success",
        lead_id: data.lead_id || "LEAD-2026-00202",
        new_status: data.status || "Processed",
        message: "Lead status updated successfully."
      }
    });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.api.v1.leads.get_assignable_users', ({ request }) => {
    return HttpResponse.json({
      message: {
        status: "success",
        results: [
          {
            email: "arnavjagadeesh12@gmail.com",
            full_name: "arnav",
            agent_id: "arnav",
            region: "Oromia"
          }
        ]
      }
    });
  }),

  http.post('*/api/proxy/api/method/oan_a2c.api.v1.leads.assign_lead', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      message: {
        status: "success",
        lead_id: data.lead_id || "LEAD-2026-00202",
        assigned_to: data.assigned_to || "arnavjagadeesh12@gmail.com",
        assigned_date: "2026-06-08",
        message: "Lead assigned successfully."
      }
    });
  }),

  http.post('*/api/proxy/api/method/oan_a2c.api.v1.leads.schedule_visit', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      message: {
        status: "success",
        schedule_id: "VSCH-2026-00267",
        message: "Visit scheduled successfully."
      }
    });
  }),

  http.post('*/api/proxy/api/method/oan_a2c.api.v1.leads.update_visit_schedule_status', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      message: {
        status: "success",
        schedule_id: data.schedule_id || "VSCH-2026-03598",
        new_status: data.status || "Completed",
        message: "Visit schedule status updated successfully."
      }
    });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.api.v1.leads.get_visit_schedules', ({ request }) => {
    const url = new URL(request.url);
    const leadId = url.searchParams.get('lead_id');

    const mockSchedules = [
      {
        name: "VSCH-2026-00267",
        lead: "LD-9823",
        visit_date: "2026-06-10",
        visit_time: "14:30:00",
        meeting_location: "Cooperative Office",
        region: "Oromia",
        zone: "East Shewa",
        woreda: "Ada'ama",
        kebele: "Kebele 02",
        status: "Scheduled",
        scheduled_by: "arnavjagadeesh12@gmail.com",
        creation: new Date(Date.now() - 86400000).toISOString()
      },
      {
        name: "VSCH-2026-00055",
        lead: "LD-9825",
        visit_date: "2026-06-11",
        visit_time: "9:00:00",
        meeting_location: "",
        region: "Amhara",
        zone: "Jimma",
        woreda: "Limmu Kosa",
        kebele: "Kebele 1",
        status: "Missed",
        scheduled_by: "test_agent@coopbank.com",
        creation: new Date().toISOString()
      }
    ];

    if (leadId) {
      const filtered = mockSchedules.filter(s => s.lead.replace('#', '') === leadId.replace('#', ''));
      return HttpResponse.json({
        message: {
          status: "success",
          start: 0,
          page_length: 20,
          total_count: filtered.length,
          results: filtered.length > 0 ? filtered : [
            {
              name: "VSCH-2026-00267",
              lead: leadId,
              visit_date: "2026-06-10",
              visit_time: "14:30:00",
              meeting_location: "Cooperative Office",
              region: "Oromia",
              zone: "East Shewa",
              woreda: "Ada'ama",
              kebele: "Kebele 02",
              status: "Scheduled",
              scheduled_by: "arnavjagadeesh12@gmail.com",
              creation: new Date().toISOString()
            }
          ]
        }
      });
    }

    return HttpResponse.json({
      message: {
        status: "success",
        start: 0,
        page_length: 20,
        total_count: mockSchedules.length,
        results: mockSchedules
      }
    });
  }),
];
