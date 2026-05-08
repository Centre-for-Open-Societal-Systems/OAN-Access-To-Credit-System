import { useEffect, useState } from 'react';
import { BadgeCheck, CircleSlash, Clock3, Plus, Users } from 'lucide-react';

import { leadRows, leadStatusOptions } from '../data/leads.mock.js';
import LeadEmptyState from '../components/LeadEmptyState.jsx';
import LeadKpiCard from '../components/LeadKpiCard.jsx';
import LeadLoadingSkeleton from '../components/LeadLoadingSkeleton.jsx';
import LeadPagination from '../components/LeadPagination.jsx';
import LeadTable from '../components/LeadTable.jsx';
import LeadToolbar from '../components/LeadToolbar.jsx';

const PAGE_SIZE = 5;

function LeadsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusValue, setStatusValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const id = window.setTimeout(() => setIsLoading(false), 900);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusValue]);

  const summary = leadRows.reduce(
    (acc, lead) => {
      acc.total += 1;
      acc[lead.status.toLowerCase()] += 1;
      return acc;
    },
    { total: 0, approved: 0, pending: 0, rejected: 0 },
  );

  const filteredLeads = leadRows.filter((lead) => {
    const query = searchValue.trim().toLowerCase();
    const searchMatches =
      query.length === 0 ||
      [lead.id, lead.name, lead.phone, lead.source, lead.product, lead.owner, lead.region].some(
        (v) => v.toLowerCase().includes(query),
      );
    return searchMatches && (statusValue === 'all' || lead.status === statusValue);
  });

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = filteredLeads.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE;
  const visibleLeads = filteredLeads.slice(startIdx, startIdx + PAGE_SIZE);

  const leadCards = [
    {
      label: 'Total Leads',
      value: summary.total.toLocaleString(),
      helper: 'All tracked pipeline opportunities.',
      icon: Users,
      tone: 'slate',
    },
    {
      label: 'Approved',
      value: summary.approved.toLocaleString(),
      helper: 'Ready for next step or disbursement.',
      icon: BadgeCheck,
      tone: 'emerald',
    },
    {
      label: 'Pending',
      value: summary.pending.toLocaleString(),
      helper: 'Awaiting review or documents.',
      icon: Clock3,
      tone: 'amber',
    },
    {
      label: 'Rejected',
      value: summary.rejected.toLocaleString(),
      helper: 'Closed leads for review.',
      icon: CircleSlash,
      tone: 'rose',
    },
  ];

  if (isLoading) return <LeadLoadingSkeleton />;

  return (
    <>
      <section className="rounded-[28px] border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-border-subtle bg-page px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">
              Lead Intelligence
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Leads Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
              Monitor the intake funnel, review status breakdowns, and keep follow-up activity
              moving.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-button px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-button-hover"
            type="button"
          >
            <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
            <span>Add Lead</span>
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {leadCards.map((card) => (
            <LeadKpiCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <LeadToolbar
          searchValue={searchValue}
          statusValue={statusValue}
          statusOptions={leadStatusOptions}
          resultCount={filteredLeads.length}
          totalCount={summary.total}
          onSearchChange={setSearchValue}
          onStatusChange={setStatusValue}
        />

        {filteredLeads.length === 0 ? (
          <LeadEmptyState
            title="No leads match your filters"
            description="Try a wider search, change the status filter, or add a new lead."
            onResetFilters={() => {
              setSearchValue('');
              setStatusValue('all');
            }}
            onAddLead={() => {}}
          />
        ) : (
          <>
            <LeadTable rows={visibleLeads} />
            <LeadPagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredLeads.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
}

export default LeadsDashboard;
