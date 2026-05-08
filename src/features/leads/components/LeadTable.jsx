import { ArrowUpRight } from 'lucide-react';
import LeadStatusBadge from './LeadStatusBadge.jsx';

const COL_HEADERS = [
  'Lead',
  'Source',
  'Product',
  'Status',
  'Amount',
  'Owner',
  'Updated',
  '',
];

function LeadTable({ rows = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Leads table">
          <thead>
            <tr className="border-b border-border-subtle bg-page">
              {COL_HEADERS.map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-text-muted first:pl-5 last:pr-5"
                  scope="col"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="transition hover:bg-slate-50/60"
              >
                <td className="pl-5 pr-4 py-3.5">
                  <p className="font-semibold text-text-primary">{row.name}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{row.id} · {row.region}</p>
                </td>
                <td className="px-4 py-3.5 text-text-muted">{row.source}</td>
                <td className="px-4 py-3.5">
                  <span className="font-medium text-text-primary">{row.product}</span>
                </td>
                <td className="px-4 py-3.5">
                  <LeadStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3.5 font-semibold text-text-primary">{row.amount}</td>
                <td className="px-4 py-3.5 text-text-muted">{row.owner}</td>
                <td className="px-4 py-3.5 text-xs text-text-muted">{row.updatedAt}</td>
                <td className="pr-5 pl-4 py-3.5">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-page px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:border-slate-300 hover:bg-white hover:text-text-primary"
                    type="button"
                    aria-label={`View lead ${row.id}`}
                  >
                    View
                    <ArrowUpRight size={12} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadTable;
