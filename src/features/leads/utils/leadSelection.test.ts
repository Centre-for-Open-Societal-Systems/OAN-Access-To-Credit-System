import { describe, expect, it } from 'vitest';
import type { Lead } from '@/features/leads/types/leads.types';
import { leadKey, toggleLead, toggleVisible } from './leadSelection';

const lead = (id: string): Lead => ({ id, phone: `+2519${id}`, creation: '' }) as Lead;
const page1 = [lead('1'), lead('2')];
const page2 = [lead('3'), lead('4')];

describe('lead selection across pages', () => {
  it('keeps a lead selected on another page when selecting on the current page', () => {
    const afterPage1 = toggleLead({}, page1[0]!);
    const afterPage2 = toggleLead(afterPage1, page2[1]!);

    expect(Object.keys(afterPage2)).toEqual([leadKey(page1[0]!), leadKey(page2[1]!)]);
    expect(Object.values(afterPage2)).toEqual([page1[0], page2[1]]);
  });

  it('unselects a lead that is already selected', () => {
    const selected = toggleLead({}, page1[0]!);
    expect(toggleLead(selected, page1[0]!)).toEqual({});
  });

  it('select-all adds the current page without dropping selections from other pages', () => {
    const selected = toggleLead({}, page1[0]!);
    const result = toggleVisible(selected, page2, false);

    expect(Object.keys(result)).toHaveLength(3);
    expect(result[leadKey(page1[0]!)]).toBe(page1[0]);
  });

  it('clearing the current page leaves selections from other pages', () => {
    const both = toggleVisible(toggleVisible({}, page1, false), page2, false);
    const result = toggleVisible(both, page2, true);

    expect(Object.values(result)).toEqual(page1);
  });
});
