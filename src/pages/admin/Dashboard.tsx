import { useEffect, useState } from 'react';
import { Users, CalendarCheck, ShoppingBag, Gift, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';

interface Stats {
  totalGuests: number;
  totalRSVPs: number;
  attendingRSVPs: number;
  pendingOrders: number;
  approvedOrders: number;
  pendingGifts: number;
  approvedGifts: number;
  totalOrderValue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalGuests: 0, totalRSVPs: 0, attendingRSVPs: 0,
    pendingOrders: 0, approvedOrders: 0, pendingGifts: 0,
    approvedGifts: 0, totalOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [guests, rsvps, orders, gifts] = await Promise.all([
        supabase.from('guests').select('id', { count: 'exact' }),
        supabase.from('rsvps').select('id, attending', { count: 'exact' }),
        supabase.from('orders').select('status, total_amount'),
        supabase.from('gifts').select('status'),
      ]);

      const orderRows = orders.data ?? [];
      const giftRows  = gifts.data ?? [];
      const rsvpRows  = rsvps.data ?? [];

      setStats({
        totalGuests:    guests.count ?? 0,
        totalRSVPs:     rsvps.count ?? 0,
        attendingRSVPs: rsvpRows.filter(r => r.attending).length,
        pendingOrders:  orderRows.filter(o => o.status === 'pending').length,
        approvedOrders: orderRows.filter(o => o.status === 'approved').length,
        pendingGifts:   giftRows.filter(g => g.status === 'pending').length,
        approvedGifts:  giftRows.filter(g => g.status === 'approved').length,
        totalOrderValue: orderRows.filter(o => o.status !== 'rejected').reduce((sum, o) => sum + (o.total_amount ?? 0), 0),
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'Total Guests',     value: stats.totalGuests,    icon: Users,         color: 'bg-blue-50 text-blue-600',   sub: 'Registered identities' },
    { label: 'RSVPs',            value: stats.totalRSVPs,     icon: CalendarCheck, color: 'bg-green-50 text-green-600', sub: `${stats.attendingRSVPs} attending` },
    { label: 'Pending Orders',   value: stats.pendingOrders,  icon: Clock,         color: 'bg-amber-50 text-amber-600', sub: 'Awaiting approval' },
    { label: 'Approved Orders',  value: stats.approvedOrders, icon: ShoppingBag,   color: 'bg-teal-50 text-teal-600',   sub: formatCurrency(stats.totalOrderValue) },
    { label: 'Pending Gifts',    value: stats.pendingGifts,   icon: Clock,         color: 'bg-orange-50 text-orange-600', sub: 'Awaiting approval' },
    { label: 'Approved Gifts',   value: stats.approvedGifts,  icon: Gift,          color: 'bg-purple-50 text-purple-600', sub: 'Confirmed gifts' },
    { label: 'Total Attendance', value: stats.attendingRSVPs, icon: CheckCircle,   color: 'bg-indigo-50 text-indigo-600', sub: 'Confirmed attending' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 font-sans">Dashboard</h1>
        <p className="text-sm text-gray-500 font-sans mt-1">Wedding overview — TheCNLovestory Part III, December 26, 2026</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-5 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide font-sans">{label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 font-sans">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 font-sans mt-1">{sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
