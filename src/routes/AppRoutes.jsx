import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout.jsx';
import Login from '../features/auth/pages/Login.jsx';
import LeadsDashboard from '../features/leads/pages/LeadsDashboard.jsx';
import NewLeadCreation from '../features/leads/pages/LeadCreation.jsx';
import LeadDetails from '../features/leads/pages/LeadDetails.jsx';
import ScheduleVisit from '../features/leads/pages/ScheduleVisit.jsx';
import LoanApplicationDashboard from '../features/loans/pages/LoanApplicationDashboard.jsx';
import NewLoanApplication from '../features/loans/pages/NewLoanApplication.jsx';
import NewLoanApplicationDashboard from '../features/loans/pages/NewLoanApplicationDashboard.jsx';
import UpdateLoanStatus from '../features/loans/pages/UpdateLoanStatus.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/leads" replace />} />
        <Route path="leads" element={<LeadsDashboard />} />
        <Route path="leads/lead" element={<NewLeadCreation />} />
        <Route path="leads/new" element={<NewLeadCreation />} />
        <Route path="leads/:id" element={<LeadDetails />} />
        <Route path="leads/:id/schedule" element={<ScheduleVisit />} />
        <Route path="loanApplicationDashboard" element={<LoanApplicationDashboard />} />
        <Route path="loans/new" element={<NewLoanApplication />} />
        <Route path="loans/applications" element={<NewLoanApplicationDashboard />} />
        <Route path="loans/update-status" element={<UpdateLoanStatus />} />
      </Route>
      <Route path="*" element={<Navigate to="/leads" replace />} />
    </Routes>
  );
}

export default AppRoutes;
