import DiscoverLoansClient, { type DiscoverLoansPortal } from './components/DiscoverLoansClient';

export default function DiscoverLoansPage({ portal }: { portal?: DiscoverLoansPortal }) {
  return (
    <div className="p-0 h-full">
      <DiscoverLoansClient {...(portal ? { portal } : {})} />
    </div>
  );
}
