// Page components (client-side) — import only from app/ route files
export { default as AgentDashboardPage } from './pages/AgentDashboardPage';
export { default as AgentLoanProductsPage } from './pages/AgentLoanProductsPage';
export { default as BankAdminApplicationsPage } from './pages/BankAdminApplicationsPage';
export { default as BankAdminDashboardPage } from './pages/BankAdminDashboardPage';
export { default as KycCompliancePage } from './pages/KycCompliancePage';
export { default as LoanProductsPage } from './pages/LoanProductsPage';
export { default as ProductApprovalsPage } from './pages/ProductApprovalsPage';
// Store — loan products
export {
    archiveProduct, clearMutationError,
    clearProductComment,
    clearSelectedProductDetail, createProductCompound, fetchDashboardStats, fetchProductComment, fetchProductDetail, fetchProducts, fetchTaxonomy, selectAttributes, selectCategories, selectProductComment, selectProductCommentStatus, selectProducts, selectProductsListError, selectProductsListStatus, selectProductsMutationError, selectProductsMutationStatus, selectSelectedProductDetail, selectSellerStats, selectTags, sellerProductsReducer, setProductStatus, updateProductCompound
} from './store/loanProductsSlice';
// Store — onboarding
export {
    clearOnboardingErrors, registerSeller,
    saveOrgContacts, sellerOnboardingReducer, uploadKycDocument
} from './store/onboardingSlice';
// Store — team
export {
    clearTeamMutationError, deactivateUser, fetchTeamUsers,
    inviteTeamMember, resetMemberPassword, selectTeamListError, selectTeamListStatus, selectTeamMutationError, selectTeamMutationStatus, selectTeamUsers, sellerTeamReducer, updateUser
} from './store/teamSlice';
// Types — safe to import from server and client contexts
export type { ArchiveLoanProductInput, CreateLoanProductCompoundInput, CreateLoanProductPayload, ListProductsParams, SetLoanProductStatusInput, UpdateLoanProductCompoundInput, UpdateLoanProductPayload } from './types/loan-products.types';
export type { RegisterSellerPayload, SaveOrgContactsPayload, UploadKycDocumentPayload } from './types/onboarding.types';
export type { InviteTeamMemberPayload, ResetMemberPasswordPayload, UpdateUserPayload, UpdateUserProfilePayload } from './types/team.types';






