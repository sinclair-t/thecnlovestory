import { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../../lib/utils';
import type { RSVP } from '../../lib/types';

export default function AdminRSVPs() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'attending' | 'not-attending'>('all');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const { data } = await supabase
      .from('rsvps')
      .select('*, guest:guests(*)')
      .order('created_at', { ascending: false });
    setRsvps((data as RSVP[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('admin-rsvps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, () => { load(true); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const filtered = rsvps.filter(r => {
    const matchFilter = filter === 'all' ? true : filter === 'attending' ? r.attending : !r.attending;
    const q = search.toLowerCase();
    const matchSearch = !q || (r.guest?.full_name ?? '').toLowerCase().includes(q) || (r.guest?.normalized_phone ?? '').includes(q);
    return matchFilter && matchSearch;
  });

  const attending = rsvps.filter(r => r.attending).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">RSVP Management</h1>
          <p className="text-sm text-gray-500 font-sans">{attending} attending · {rsvps.length - attending} not attending</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-sans text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'attending', 'not-attending'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-sans font-medium rounded-md transition-colors capitalize
                  ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold-400 w-52" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 font-sans text-sm">Loading RSVPs...</div>
        : filtered.length === 0 ? <div className="p-12 text-center text-gray-400 font-sans text-sm">No RSVPs found.</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Guest', 'Phone', 'Attending', 'Guests', 'Note', 'Source', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-900">{r.guest?.full_name ?? 'Unknown'}</td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{r.guest?.normalized_phone ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      {r.attending
                        ? <span className="flex items-center gap-1.5 text-green-700"><CheckCircle size={14} /> Yes</span>
                        : <span className="flex items-center gap-1.5 text-red-600"><XCircle size={14} /> No</span>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{r.guest_count}</td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-xs truncate">{r.note ?? '—'}</td>
                    <td className="px-4 py-3.5"><span className="badge-info rounded-full capitalize">{r.source}</span></td>
                    <td className="px-4 py-3.5 text-gray-400">{formatDateTime(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
