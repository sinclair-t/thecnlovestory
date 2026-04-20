import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../../lib/utils';
import type { Guest } from '../../lib/types';

export default function AdminGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('guests').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setGuests(data ?? []); setLoading(false); });
  }, []);

  const filtered = guests.filter(g =>
    g.full_name.toLowerCase().includes(search.toLowerCase()) ||
    g.normalized_phone.includes(search) ||
    (g.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">Guest Directory</h1>
          <p className="text-sm text-gray-500 font-sans">{guests.length} registered guests</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guests..."
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold-400 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-sans text-sm">Loading guests...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="font-sans text-gray-400">No guests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Phone', 'Email', 'Country', 'Registered'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-900">{g.full_name}</td>
                    <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">{g.normalized_phone}</td>
                    <td className="px-4 py-3.5 text-gray-500">{g.email ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500">{g.country_code}</td>
                    <td className="px-4 py-3.5 text-gray-400">{formatDateTime(g.created_at)}</td>
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
