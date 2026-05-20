import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Clock, CheckCircle2, Edit3 } from 'lucide-react';
import { leadRows } from '../data/leads.mock.js';

/* ── demo fallback ── */
const DEMO_LEAD = {
  id: '#LD-9825',
  location: 'Oromia, Jimma Zone',
  phone: '+251 911 234 567',
  name: 'Abebe Kebede',
};

/* ── derive display name from lead data ── */
function getDisplayName(lead) {
  if (lead.name) return lead.name;
  return `Lead ${lead.id.replace(/^#/, '')}`;
}

function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/* ── page ── */
function ScheduleVisit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const found = leadRows.find(l => l.id === id || l.id === `#${id}`);
  const lead  = found ?? DEMO_LEAD;
  const name  = getDisplayName(lead);
  const initials = getInitials(name);

  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [location,  setLocation]  = useState("Farmer's Primary Farm (Jimma Zone)");
  const [agenda,    setAgenda]    = useState('');

  return (
    <div className="space-y-4">
      {/* back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition hover:text-text-primary"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* lead profile card */}
      <div className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-white px-6 py-4 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
          {initials}
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary">{name}</h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {lead.location}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Phone size={12} />
              {lead.phone}
            </span>
          </div>
        </div>
      </div>

      {/* two-column layout */}
      <div className="flex items-start gap-4">
        {/* ── schedule form ── */}
        <div className="min-w-0 flex-1 rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary">Schedule New Visit</h2>

          <div className="mt-5 space-y-4">
            {/* date + time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Visit Date</label>
                <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-green-500">
                  <Clock size={14} className="shrink-0 text-text-muted" />
                  <input
                    type="date"
                    value={visitDate}
                    onChange={e => setVisitDate(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Visit Time</label>
                <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-green-500">
                  <Clock size={14} className="shrink-0 text-text-muted" />
                  <input
                    type="time"
                    value={visitTime}
                    onChange={e => setVisitTime(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* meeting location */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Meeting Location</label>
              <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-green-500">
                <MapPin size={14} className="shrink-0 text-text-muted" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Farmer's Primary Farm (Jimma Zone)"
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
            </div>

            {/* agenda */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Agenda / Notes</label>
              <textarea
                rows={5}
                value={agenda}
                onChange={e => setAgenda(e.target.value)}
                placeholder="What is the purpose of this visit?"
                className="w-full resize-none rounded-xl border border-border-subtle bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* footer */}
          <div className="mt-5 flex justify-end gap-3 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-medium text-text-primary transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Save Schedule
            </button>
          </div>
        </div>

        {/* ── sidebar ── */}
        <div className="w-72 shrink-0 space-y-4">
          {/* upcoming visit */}
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3">
              <Clock size={14} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Upcoming Visit</span>
            </div>
            <div className="space-y-2 p-4">
              <p className="text-base font-bold text-text-primary">Tomorrow, 10:00 AM</p>
              <p className="flex items-center gap-1.5 text-xs text-text-muted">
                <MapPin size={11} />
                Jimma Zone, Kebele Office
              </p>
              <p className="text-xs leading-relaxed text-text-muted">
                Initial assessment and Fayda OTP consent collection.
              </p>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <CheckCircle2 size={14} />
                  Mark Completed
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle py-2.5 text-sm font-medium text-text-primary transition hover:bg-slate-50"
                >
                  <Edit3 size={13} />
                  Reschedule
                </button>
              </div>
            </div>
          </div>

          {/* visit history */}
          <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-text-primary">Visit History</h3>
            <div className="mt-3 flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <CheckCircle2 size={12} className="text-slate-500" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">Initial Contact Meeting</p>
                  <span className="text-xs text-text-muted">Oct 20</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  Met at the local cooperative office to discuss loan requirements.
                </p>
                <p className="mt-1 text-xs italic text-text-muted">No further history.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleVisit;
