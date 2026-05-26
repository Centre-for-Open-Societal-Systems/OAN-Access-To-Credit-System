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

  http.get('/api/leads', () => {
    return HttpResponse.json(leadRows);
  }),
];
