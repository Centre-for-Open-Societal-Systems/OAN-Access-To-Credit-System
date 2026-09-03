"use client";
import { DiscoverLoansCta } from '@/components/DiscoverLoansCta';
import { useMemo } from 'react';
import { NO_VALUE, formatAmount, formatRate, formatRateRange, formatTenure } from '../../format';
import type { CatalogProduct, FarmerLoanApplication } from '../../types';
import { ALL_TAB, filterByTab, type StageTab } from '../counts';
import ApplicationCard from './ApplicationCard';

export function formatCreationDate(creation?: string | null): string {
  if (!creation) return NO_VALUE;
  const d = new Date(creation);
  if (isNaN(d.getTime())) {
    return `Created on ${creation.split(' ')[0]}`;
  }
  return `Created on ${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export default function ApplicationList({
  activeTab,
  onTabChange,
  applications,
  products,
  tabs,
  onRefresh,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  applications: FarmerLoanApplication[];
  products?: CatalogProduct[] | undefined;
  /** One per stage, from `buildStageTabs`. Never a hardcoded list. */
  tabs: StageTab[];
  onRefresh?: () => void;
}) {
  const filteredApplications = useMemo(
    () => filterByTab(applications, activeTab),
    [applications, activeTab]
  );

  const productMap = useMemo(() => {
    const map = new Map<string, CatalogProduct>();
    for (const p of products ?? []) {
      if (p.name) map.set(p.name, p);
      if (p.slug) map.set(p.slug, p);
      if (p.product_name) map.set(p.product_name.toLowerCase(), p);
    }
    return map;
  }, [products]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 shrink-0">Status</h2>
        <div className="flex items-center gap-1 overflow-x-auto bg-gray-50 rounded-lg p-1 border border-gray-100">
          <TabButton
            label="Total"
            count={applications.length}
            isActive={activeTab === ALL_TAB}
            onClick={() => onTabChange(ALL_TAB)}
          />
          {tabs.map((tab) => (
            <TabButton
              key={tab.value}
              label={tab.label}
              count={tab.count}
              isActive={activeTab === tab.value}
              onClick={() => onTabChange(tab.value)}
            />
          ))}
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        // An empty grid used to render as blank space under the tabs. Which of
        // the two empties it is matters: someone who has never applied needs the
        // catalogue, someone filtering to a tab they have nothing in just needs
        // to know the filter is why.
        applications.length === 0 ? (
          <DiscoverLoansCta
            variant="empty"
            title="You have not applied for a loan yet"
            description="Browse loan products from every participating bank and compare amounts, rates and tenure before you apply."
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
            <p className="text-[15px] font-semibold text-gray-900">No {activeTab.toLowerCase()} applications</p>
            <p className="mt-1 text-[14px] text-gray-500">
              Your other applications are still here — switch tabs to see them.
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredApplications.map((app) => {
            const product =
              (app.loan_product ? productMap.get(app.loan_product) : undefined) ??
              (app.loan_product_name ? productMap.get(app.loan_product_name.toLowerCase()) : undefined);

            const interest = app.interest_rate != null
              ? formatRate(app.interest_rate)
              : formatRateRange(product?.min_interest_rate, product?.max_interest_rate);

            const tenure = app.tenure_months != null
              ? formatTenure(app.tenure_months)
              : formatTenure(product?.tenure_months);

            const maxAmount = formatAmount(app.requested_amount ?? app.loan_amount ?? product?.max_amount);
            const title = app.loan_product_name || product?.product_name || app.loan_type || 'Unknown Product';
            const subtitle = formatCreationDate(app.creation);

            return (
              <ApplicationCard
                key={app.application_id}
                applicationId={app.application_id}
                application={app}
                title={title}
                subtitle={subtitle}
                maxAmount={maxAmount}
                interest={interest}
                tenure={tenure}
                repayment={NO_VALUE}
                onApplicationUpdated={onRefresh}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex shrink-0 items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
    >
      {label}{' '}
      <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    </button>
  );
}
