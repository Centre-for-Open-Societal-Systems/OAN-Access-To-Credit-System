'use client';
import LeadsDashboard from '../leads-dashboard/page';

export default function NewLeadCreation() {
  // NOTE: In the original React project, the junior developer duplicated the LeadsDashboard into LeadCreation.jsx
  // without changing the UI/UX to build a form. To preserve the exact UI/UX as requested, we render the LeadsDashboard here.
  return <LeadsDashboard />;
}
