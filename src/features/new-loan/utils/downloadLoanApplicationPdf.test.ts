import { describe, expect, it, vi } from 'vitest';
import { createLoanApplicationPdf, downloadLoanApplicationPdf, type LoanApplicationPdfData } from './downloadLoanApplicationPdf';

const application: LoanApplicationPdfData = {
  applicationId: 'APP-2026-00107',
  applicantName: 'Test Farmer',
  submittedAt: new Date('2026-11-05T08:30:00Z'),
  loanType: 'Agricultural Loan',
  purpose: 'Seeds and fertilizer',
  requestedAmount: '25000',
  duration: '12 months',
  phone: '+251900000000',
  region: 'Oromia',
};

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsText(blob);
  });
}

describe('loan application PDF', () => {
  it('creates a PDF containing the submitted application details', async () => {
    const pdf = createLoanApplicationPdf(application);
    const contents = await readBlob(pdf);

    expect(pdf.type).toBe('application/pdf');
    expect(contents.startsWith('%PDF-1.4')).toBe(true);
    expect(contents).toContain('(APP-2026-00107)');
    expect(contents).toContain('(Test Farmer)');
    expect(contents).toContain('(ETB 25,000)');
    expect(contents).toContain('(Application Submitted Successfully!)');
    expect(contents).toContain('/Helvetica-Bold');
    expect(contents).toContain('0.086 0.639 0.29 rg');
    expect(contents).toContain('%%EOF');
  });

  it('downloads the generated PDF with an application-specific filename', () => {
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:loan-pdf');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    downloadLoanApplicationPdf(application);

    expect(createObjectUrl).toHaveBeenCalledWith(expect.objectContaining({ type: 'application/pdf' }));
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:loan-pdf');

    const link = click.mock.instances[0];
    if (!(link instanceof HTMLAnchorElement)) throw new Error('Expected the PDF download to use an anchor element');
    expect(link.download).toBe('loan-application-APP-2026-00107.pdf');
  });
});
