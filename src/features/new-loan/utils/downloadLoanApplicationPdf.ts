export interface LoanApplicationPdfData {
  applicationId: string;
  applicantName: string;
  submittedAt: Date;
  loanType: string | null;
  purpose: string | null;
  requestedAmount: string | null;
  duration: string | null;
  phone: string | null;
  region: string | null;
}

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

function escapePdfText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/([\\()])/g, '\\$1');
}

function fitText(value: string, maxLength = 38): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

function text(value: string, x: number, y: number, size: number, options?: { bold?: boolean; color?: string }): string {
  const font = options?.bold ? 'F2' : 'F1';
  const color = options?.color ?? '0.067 0.094 0.153';
  return `BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${escapePdfText(value)}) Tj ET`;
}

function detailCard(label: string, value: string | null, x: number, y: number): string[] {
  return [
    '0.976 0.98 0.984 rg',
    `${x} ${y} 219 58 re f`,
    '0.898 0.906 0.922 RG 0.7 w',
    `${x} ${y} 219 58 re S`,
    text(label.toUpperCase(), x + 14, y + 38, 8, { bold: true, color: '0.42 0.455 0.51' }),
    text(fitText(value ?? 'Not provided'), x + 14, y + 17, 11, { bold: true }),
  ];
}

function createPdfContent(data: LoanApplicationPdfData): string {
  const amount = data.requestedAmount
    ? `ETB ${Number(data.requestedAmount).toLocaleString('en-US')}`
    : null;
  const submittedOn = data.submittedAt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const rows: Array<[string, string | null]> = [
    ['Applicant', data.applicantName],
    ['Loan type', data.loanType],
    ['Purpose', data.purpose],
    ['Requested amount', amount],
    ['Duration', data.duration],
    ['Phone', data.phone],
    ['Region', data.region],
  ];

  const commands: string[] = [
    // Soft gray-green page background.
    '0.969 0.98 0.973 rg 0 0 595 842 re f',
    // Success banner matching the UI.
    '0.086 0.639 0.29 rg 0 622 595 220 re f',
    // Confirmation icon.
    '0.118 0.776 0.357 rg',
    '297 786 m 311.36 786 323 774.36 323 760 c 323 745.64 311.36 734 297 734 c 282.64 734 271 745.64 271 760 c 271 774.36 282.64 786 297 786 c f',
    '1 1 1 RG 4 w 285 760 m 294 751 l 311 769 l S',
    text('Application Submitted Successfully!', 108, 704, 22, { bold: true, color: '1 1 1' }),
    text('Your loan application was securely submitted for review.', 133, 680, 10, { color: '0.88 1 0.92' }),
    // Status badge.
    '0.067 0.482 0.22 rg 220 642 155 25 re f',
    text('VERIFIED & SUBMITTED', 236, 650, 9, { bold: true, color: '1 1 1' }),
    // Main summary card and subtle shadow.
    '0.86 0.89 0.87 rg 44 75 515 515 re f',
    '1 1 1 rg 40 81 515 515 re f',
    '0.88 0.90 0.89 RG 0.8 w 40 81 515 515 re S',
    text('Application Summary', 64, 558, 17, { bold: true }),
    text('Keep this document for your records.', 64, 538, 9, { color: '0.42 0.455 0.51' }),
    // Application reference cards.
    '0.94 0.98 0.95 rg 64 474 219 48 re f',
    '0.78 0.9 0.81 RG 0.8 w 64 474 219 48 re S',
    text('APPLICATION ID', 78, 504, 8, { bold: true, color: '0.086 0.639 0.29' }),
    text(fitText(data.applicationId), 78, 485, 12, { bold: true }),
    '0.94 0.98 0.95 rg 312 474 219 48 re f',
    '0.78 0.9 0.81 RG 0.8 w 312 474 219 48 re S',
    text('SUBMITTED ON', 326, 504, 8, { bold: true, color: '0.086 0.639 0.29' }),
    text(fitText(submittedOn, 32), 326, 485, 10, { bold: true }),
    text('APPLICATION DETAILS', 64, 446, 9, { bold: true, color: '0.086 0.639 0.29' }),
  ];

  rows.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    commands.push(...detailCard(label, value, column === 0 ? 64 : 312, 374 - row * 72));
  });
  commands.push(
    '0.086 0.639 0.29 rg 40 81 515 7 re f',
    text('A2C  |  Access to Credit', 64, 46, 9, { bold: true, color: '0.086 0.639 0.29' }),
    text('Generated from your submitted application', 356, 46, 8, { color: '0.42 0.455 0.51' }),
  );

  return commands.join('\n');
}

export function createLoanApplicationPdf(data: LoanApplicationPdfData): Blob {
  const content = createPdfContent(data);
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach(offset => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function downloadLoanApplicationPdf(data: LoanApplicationPdfData): void {
  const pdf = createLoanApplicationPdf(data);
  const url = URL.createObjectURL(pdf);
  const link = document.createElement('a');
  const safeApplicationId = data.applicationId.replace(/[^a-zA-Z0-9_-]/g, '-');

  link.href = url;
  link.download = `loan-application-${safeApplicationId}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
