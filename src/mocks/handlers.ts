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

  http.get('*/api/proxy/api/method/oan_a2c.openagrinet_access_to_credit.doctype.loan_application.loan_application.get_loan_applications', ({ request }) => {
    const url = new URL(request.url);
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
    const pageSize = parseInt(url.searchParams.get('page_size') || '10', 10);

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

    return HttpResponse.json({
      message: {
        results: paginatedRows,
        total_count: totalCount
      }
    });
  }),

  http.get('*/api/proxy/api/method/oan_a2c.openagrinet_access_to_credit.doctype.loan_application.loan_application.get_loan_summary', () => {
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
      message: summary
    });
  }),
];
