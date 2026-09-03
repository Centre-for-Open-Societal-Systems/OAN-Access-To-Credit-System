"use client";
import { PanelLoader } from '@/components/ui/Loader';
import type { LoanStatusMeta } from '@/lib/api/api.schemas';
import { logger } from '@/lib/logger';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllMyApplications, getCatalog, getLoanStatusMetadata } from '../api/farmerApi';
import type { CatalogProduct, FarmerLoanApplication } from '../types';
import ApplicationList from './components/ApplicationList';
import ApplicationSummary from './components/ApplicationSummary';
import { DiscoverLoansCta } from '@/components/DiscoverLoansCta';
import { ALL_TAB, buildStageTabs } from './counts';

/**
 * `ALL_TAB`, or a stage label belonging to one of the banks this farmer has
 * applied to. Not an enum — the labels come from the API.
 */
export type TabType = string;

export default function MyApplicationsPage() {
    const [activeTab, setActiveTab] = useState<TabType>(ALL_TAB);
    const [applications, setApplications] = useState<FarmerLoanApplication[]>([]);
    const [statuses, setStatuses] = useState<LoanStatusMeta[]>([]);
    const [products, setProducts] = useState<CatalogProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // A swallowed failure rendered as "no applications", which for someone who
    // has applied is not a neutral message — it is the app telling them their
    // application is gone.
    const [loadFailed, setLoadFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const retry = useCallback(() => setAttempt((n) => n + 1), []);

    useEffect(() => {
        let isMounted = true;
        const fetchApps = async () => {
            setIsLoading(true);
            setLoadFailed(false);
            try {
                // The applications are the page; the stage metadata only names
                // and orders the tabs. The catalog products enrich applications
                // with terms (interest rate range, tenure) when not snapshotted.
                const [applicationsResult, statusesResult, catalogResult] = await Promise.allSettled([
                    getAllMyApplications(),
                    getLoanStatusMetadata(),
                    getCatalog({ limit: 100 }),
                ]);

                if (!isMounted) return;

                if (applicationsResult.status === 'rejected') {
                    throw applicationsResult.reason;
                }
                setApplications(applicationsResult.value);

                if (statusesResult.status === 'fulfilled') {
                    setStatuses(statusesResult.value.data?.statuses ?? []);
                } else {
                    logger.warn('Failed to load loan status metadata', statusesResult.reason);
                    setStatuses([]);
                }

                if (catalogResult.status === 'fulfilled' && catalogResult.value.data?.products) {
                    setProducts(catalogResult.value.data.products);
                } else if (catalogResult.status === 'rejected') {
                    logger.warn('Failed to load product catalog for application enrichment', catalogResult.reason);
                    setProducts([]);
                }
            } catch (e) {
                logger.error('Failed to load farmer applications', e);
                if (isMounted) setLoadFailed(true);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchApps();
        return () => { isMounted = false; };
    }, [attempt]);

    const tabs = useMemo(() => buildStageTabs(applications, statuses), [applications, statuses]);

    // A stage the farmer no longer has anything in can disappear between
    // refreshes; falling back to "all" keeps the list from rendering empty with
    // a tab selected that no longer exists.
    const selectedTab = activeTab === ALL_TAB || tabs.some((tab) => tab.value === activeTab)
        ? activeTab
        : ALL_TAB;

    return (
        <div className="w-full mx-auto pb-8 space-y-4">
            <div className="bg-white p-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
                <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
            </div>

            <DiscoverLoansCta
                href="/discover-loans"
                title="Discover Loans"
                description="Explore available loan products from participating banks to find the right fit for your farming needs."
            />

            {isLoading ? (
                <PanelLoader label="Loading your applications…" />
            ) : loadFailed ? (
                <div className="bg-white rounded-2xl p-10 border border-[#F1F3F4] flex flex-col items-center text-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">We could not load your applications</h2>
                    <p className="text-[15px] text-gray-500 max-w-sm leading-relaxed">
                        This is a problem on our side, not with your applications. Please try again.
                    </p>
                    <button
                        onClick={retry}
                        className="mt-2 bg-[#16A34A] hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
                    >
                        Try again
                    </button>
                </div>
            ) : (
                <>
                    <ApplicationSummary
                        activeTab={selectedTab}
                        onTabChange={setActiveTab}
                        total={applications.length}
                        tabs={tabs}
                    />
                    <ApplicationList
                        activeTab={selectedTab}
                        onTabChange={setActiveTab}
                        applications={applications}
                        products={products}
                        tabs={tabs}
                        onRefresh={retry}
                    />
                </>
            )}
        </div>
    );
}
