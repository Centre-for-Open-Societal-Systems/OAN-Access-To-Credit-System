import { http, HttpResponse } from 'msw';
import { DUMMY_LOANS } from './loans.mock';
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
      phone_number: row.phone,
      loan_type: 'Input Financing', // Mocked defaults for what's missing in leadRows
      loan_amount: '10000',
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
];
