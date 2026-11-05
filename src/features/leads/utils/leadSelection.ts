import type { Lead } from '@/features/leads/types/leads.types';

// Selected leads are kept as objects, not just keys, so a selection made on one
// page can still be exported after the table has paged to a different set of rows.
export type LeadSelection = Record<string, Lead>;

export const leadKey = (lead: Lead): string => lead.id + lead.phone;

export function toggleLead(selection: LeadSelection, lead: Lead): LeadSelection {
  const key = leadKey(lead);
  if (key in selection) {
    const { [key]: _removed, ...rest } = selection;
    return rest;
  }
  return { ...selection, [key]: lead };
}

// Select all / clear the rows on the current page only; selections on other pages stay.
export function toggleVisible(selection: LeadSelection, visible: Lead[], allVisibleSelected: boolean): LeadSelection {
  if (!allVisibleSelected) {
    return { ...selection, ...Object.fromEntries(visible.map((lead) => [leadKey(lead), lead])) };
  }
  const visibleKeys = new Set(visible.map(leadKey));
  return Object.fromEntries(Object.entries(selection).filter(([key]) => !visibleKeys.has(key)));
}
