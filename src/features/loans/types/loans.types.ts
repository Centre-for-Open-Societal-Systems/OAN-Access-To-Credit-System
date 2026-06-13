export interface LoanFormData {
  // NOTE: Index signature [key: string]: any was removed to enforce strict type safety.
  // All fields used across the codebase must be explicitly declared here.
  fullName?: string;
  region?: string;
  mobilePhone?: string;
  requestedAmount?: string;
  loanDuration?: string;
  loanType?: 'input' | 'machinery' | string;
  preferredBank?: string;
  repaymentFrequency?: string;
  gender?: string;
  educationLevel?: string;
  faydaId?: string;
  fatherName?: string;
  grandfatherName?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  alternatePhone?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  farmRegion?: string;
  farmZone?: string;
  farmWoreda?: string;
  farmKebele?: string;
  landOwnership?: string;
  totalFarmSize?: string;
  landCertificateNo?: string;
  distanceToRoad?: string;
  primaryCropType?: string;
  secondaryCrop?: string;
  farmingSeason?: string;
  farmingSeasonYears?: string;
  expectedYield?: string;
  farmingPractices?: Record<string, boolean>;
  purposeOfLoan?: string;
  loanPurpose?: string;
  detailedUseOfFunds?: string;
}

export interface Loan {
  id: string;
  applicant: string;
  type: string;
  status: 'Pending Review' | 'Approved' | 'Action Required' | 'Draft' | string;
  statusTone: 'info' | 'success' | 'danger' | 'neutral' | string;
  updated?: string;
  submittedAt?: string;
  amount: string;
  phone: string;
  region: string;
  loanTerm: string;
  formData: LoanFormData;
}
