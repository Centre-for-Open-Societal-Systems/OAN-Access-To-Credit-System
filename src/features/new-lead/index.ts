// Selectors, actions, and thunks from newLeadSlice
export {
  selectNewLeadState,
  selectActiveLeadId,
  selectLeadSource,
  selectLeadStatus,
  selectLeadSourcesOptions,
  selectLeadStatusesOptions,
  selectLoanTypesOptions,
  selectCreditInfo,
  selectCallDetails,
  selectActivities,
  selectIsSubmitting,
  selectIsLeadFinalized,
  initializeLead,
  setLeadSource,
  setLeadStatus,
  addCreditInfo,
  clearForm,
  fetchLeadMetadataThunk,
  fetchCallDetailsThunk,
  fetchActivitiesThunk,
  addActivityNoteThunk,
  fetchCreditInfoThunk,
  addCreditInfoThunk,
  fetchSpecificLeadThunk,
  submitNewLeadThunk,
  updateLeadStatusThunk,
} from './store/newLeadSlice';

// Selectors, actions, thunks, and types from farmerSlice
export {
  searchFarmerThunk,
  fetchLeadDetailsThunk,
  setFarmerId,
  updateFarmerDetails,
  clearFarmerState,
  selectFarmerState,
} from './store/farmerSlice';
export type { FarmerDetails } from './store/farmerSlice';

// Selectors, actions, and thunks from consentSlice
export {
  searchFarmerConsent,
  verifyOtpThunk,
  clearConsentState,
  selectConsentState,
} from './store/consentSlice';

// Selectors, actions, and thunks from visitSlice
export {
  fetchVisitSchedulesThunk,
  scheduleVisitThunk,
  updateVisitScheduleStatusThunk,
  setVisitSchedule,
  clearVisitState,
  selectVisitState,
} from './store/visitSlice';

// Selectors, actions, and thunks from assignmentSlice
export {
  fetchAssignmentInfoThunk,
  assignLeadThunk,
  clearAssignmentState,
  selectAssignmentState,
} from './store/assignmentSlice';

export type { CreditInfo, CallDetail, Activity } from './store/newLeadSlice';
