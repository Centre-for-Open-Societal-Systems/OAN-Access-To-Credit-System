import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLeads } from '@/features/leads/store/leadSlice';
import { initializeLead } from '@/features/new-lead/store/newLeadSlice';

/**
 * A custom hook to handle Redux state initialization for a Lead.
 * It ensures the Redux slice is hydrated with the selected Lead's data
 * without causing infinite loops or wiping data during background polling.
 * 
 * @param id The ID of the lead from the URL params, or undefined if creating a new lead.
 */
export function useLeadInitialization(id?: string) {
    const dispatch = useAppDispatch();
    const leads = useAppSelector(selectLeads);
    const lastInitializedId = useRef<string | null | undefined>(null);

    useEffect(() => {
        // Use 'NEW' to distinctively track the creation wizard
        const currentIdKey = id === undefined ? 'NEW' : id;

        if (lastInitializedId.current === currentIdKey) {
            // Already fully initialized for this specific route
            return;
        }

        if (!id) {
            // New Lead Mode - completely clear form
            dispatch(initializeLead({}));
            lastInitializedId.current = currentIdKey;
            return;
        }

        // Existing Lead Mode
        const existingLead = leads.find(l => l.id.replace('#', '') === id);

        // If leads haven't loaded yet from the backend, we initialize the ID so
        // parallel fetches (like call logs) can start, but we DO NOT lock initialization
        // so it can re-run and populate the farmer details once the leads arrive.
        if (!existingLead && leads.length === 0) {
            dispatch(initializeLead({ id: `#${id}` }));
            lastInitializedId.current = currentIdKey;
            return;
        }

        const nameParts = existingLead?.name ? existingLead.name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        dispatch(initializeLead({
            id: `#${id}`,
            source: existingLead?.source || '',
            status: existingLead?.status || '',
            farmerId: existingLead?.farmerId || '',
            consentDate: existingLead?.consentDate || '',
            consentRequestId: existingLead?.consentRequestId || null,
            farmerDetails: {
                firstName,
                lastName,
                phoneNumber: existingLead?.farmerPhone || '',
                location: existingLead?.location || ''
            }
        }));

        lastInitializedId.current = currentIdKey;

    }, [id, leads, dispatch]);
}
