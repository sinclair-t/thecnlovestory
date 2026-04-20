import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, Eye, ChevronDown, ChevronUp, Import as SortAsc, Dessert as SortDesc, CheckCircle2, XCircle, Clock, Package, Truck, Filter, Receipt as ReceiptIcon, User, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import StatusBadge from '../../components/ui/StatusBadge';
import ReceiptPreviewModal from '../../components/ui/ReceiptPreviewModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import type { Order, Receipt } from '../../lib/types';

type OrderStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'shipped';
type SortField = 'created_at' | 'total_amount' | 'buyer_name';
type SortDir = 'asc' | 'desc';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface PendingAction {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  label: string;
  removeRsvp: boolean;
  restoreRsvp: boolean;
}

const STATUS_ACTIONS: { status: string; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'pending',   label: 'Set Pending',  icon: <Clock size={12} />,        color: 'text-amber-700 border-amber-200 hover:bg-amber-50' },
  { status: 'approved',  label: 'Approve',      icon: <CheckCircle2 size={12} />, color: 'text-green-700 border-green-200 hover:bg-green-50' },
  { status: 'rejected',  label: 'Reject',       icon: <XCircle size={12} />,      color: 'text-red-700 border-red-200 hover:bg-red-50' },
  { status: 'shipped',   label: 'Mark Shipped', icon: <Truck size={12} />,        color: 'text-teal-700 border-teal-200 hover:bg-teal-50' },
  { status: 'fulfilled', label: 'Fulfill',      icon: <Package size={12} />,      color: 'text-blue-700 border-blue-200 hover:bg-blue-50' },
];

let toastId = 0;

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [{ data: ordersData, error: ordersErr }, { data: receiptsData, error: receiptsErr }] = await Promise.all([
        supabase
          .from('orders')
          .select('*, items:order_items(*, product:asoebe_products(name))')
          .order('created_at', { ascending: false }),
        supabase
          .from('receipts')
          .select('*')
          .eq('reference_type', 'order'),
      ]);
      if (ordersErr) throw ordersErr;
      if (receiptsErr) throw receiptsErr;
      const receiptsByOrder = (receiptsData ?? []).reduce<Record<string, Receipt[]>>((acc, r) => {
        (acc[r.reference_id] ??= []).push(r as Receipt);
        return acc;
      }, {});
      const merged = (ordersData ?? []).map(o => ({ ...o, receipts: receiptsByOrder[o.id] ?? [] }));
      setOrders(merged as Order[]);
    } catch {
      addToast('error', 'Failed to load orders. Please try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { load(true); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => { load(true); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, () => { load(true); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const handleStatusClick = (order: Order, newStatus: string, label: string) => {
    if (order.status === newStatus) return;
    setPendingAction({
      orderId: order.id,
      previousStatus: order.status,
      newStatus,
      label,
      removeRsvp: newStatus === 'rejected',
      restoreRsvp: order.status === 'rejected' && newStatus === 'approved',
    });
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    setConfirmLoading(true);

    const { orderId, newStatus, removeRsvp, restoreRsvp } = pendingAction;

    const { data, error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_new_status: newStatus,
    });

    if (error || !data?.success) {
      addToast('error', error?.message ?? data?.message ?? 'Failed to update order status.');
      setConfirmLoading(false);
      setPendingAction(null);
      return;
    }

    const rsvpAction: string = data.rsvp_action ?? 'none';

    if (removeRsvp) {
      if (rsvpAction === 'deleted') {
        addToast('success', 'Order rejected and RSVP removed successfully.');
      } else {
        addToast('success', 'Order rejected. No linked RSVP was found to remove.');
      }
    } else if (restoreRsvp) {
      if (rsvpAction === 'inserted') {
        addToast('success', 'Order approved and RSVP restored successfully.');
      } else if (rsvpAction === 'already_exists') {
        addToast('success', 'Order approved. Guest already has an active RSVP.');
      } else {
        addToast('success', 'Order approved. No linked guest to restore RSVP for.');
      }
    } else {
      addToast('success', `Order status updated to "${newStatus}".`);
    }

    setConfirmLoading(false);
    setPendingAction(null);
    setUpdating(orderId);
    await load(true);
    setUpdating(null);
  };

  const toggleExpand = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const filtered = orders
    .filter(o => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.buyer_name.toLowerCase().includes(q) ||
        o.normalized_phone.includes(q) ||
        o.shipping_city?.toLowerCase().includes(q) ||
        o.shipping_state?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'created_at') cmp = a.created_at.localeCompare(b.created_at);
      else if (sortField === 'total_amount') cmp = a.total_amount - b.total_amount;
      else if (sortField === 'buyer_name') cmp = a.buyer_name.localeCompare(b.buyer_name);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    fulfilled: orders.filter(o => o.status === 'fulfilled').length,
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortDir === 'asc' ? <SortAsc size={13} className="text-gold-500" /> : <SortDesc size={13} className="text-gold-500" />
      : <SortAsc size={13} className="text-gray-300" />;

  return (
    <div className="relative">
      {/* Toast Stack */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg font-sans text-sm font-medium transition-all duration-300 ${
            t.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {t.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 font-sans">Asoebi Orders</h1>
            <p className="text-sm text-gray-500 font-sans mt-0.5">{orders.length} total orders</p>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-sans text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {(['all', 'pending', 'approved', 'rejected', 'shipped', 'fulfilled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors border ${
                statusFilter === s
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className={`ml-1.5 ${statusFilter === s ? 'text-white/70' : 'text-gray-400'}`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, city..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-sans">Sort:</span>
            {([['created_at', 'Date'], ['total_amount', 'Amount'], ['buyer_name', 'Name']] as [SortField, string][]).map(([f, l]) => (
              <button
                key={f}
                onClick={() => toggleSort(f)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-sans border rounded-lg transition-colors ${
                  sortField === f ? 'border-gold-400 bg-gold-50 text-gold-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {l} <SortIcon field={f} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-40 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <Package size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="font-sans text-gray-400 text-sm">No orders found.</p>
          </div>
        ) : filtered.map(order => {
          const isExpanded = expanded.has(order.id);
          const isUpdating = updating === order.id;
          return (
            <div key={order.id} className={`bg-white rounded-xl border transition-all duration-200 ${
              isUpdating ? 'opacity-60 pointer-events-none' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}>
              {/* Order Header Row */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-sans font-semibold text-gray-900">{order.buyer_name}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-sans flex-wrap">
                    <span className="flex items-center gap-1"><User size={11} />{order.normalized_phone}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{order.shipping_city}, {order.shipping_state}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} />{formatDateTime(order.created_at)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-sans font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                  {order.items && (
                    <p className="text-xs text-gray-400 font-sans">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
                <div className="text-gray-400 flex-shrink-0">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
                  {/* Shipping */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-sans">Shipping Address</p>
                    <p className="text-sm text-gray-700 font-sans">
                      {order.shipping_address}, {order.shipping_city}, {order.shipping_state}, {order.shipping_country}
                    </p>
                    {order.delivery_notes && (
                      <p className="text-xs text-gray-500 font-sans mt-1 italic">Note: {order.delivery_notes}</p>
                    )}
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-sans">Order Items</p>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="w-full text-sm font-sans">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left px-3 py-2 text-xs text-gray-500 font-semibold">Product</th>
                              <th className="text-right px-3 py-2 text-xs text-gray-500 font-semibold">Qty (yds)</th>
                              <th className="text-right px-3 py-2 text-xs text-gray-500 font-semibold">Rate</th>
                              <th className="text-right px-3 py-2 text-xs text-gray-500 font-semibold">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map(item => (
                              <tr key={item.id} className="border-b border-gray-100 last:border-0">
                                <td className="px-3 py-2 text-gray-800">{item.product_name}</td>
                                <td className="px-3 py-2 text-right text-gray-600">{item.quantity_in_yards}</td>
                                <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(item.price_per_yard)}</td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-800">{formatCurrency(item.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-100">
                              <td colSpan={3} className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Total</td>
                              <td className="px-3 py-2 text-right font-bold text-gray-900">{formatCurrency(order.total_amount)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Receipts */}
                  {order.receipts && order.receipts.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-sans">Payment Receipt</p>
                      <div className="flex flex-wrap gap-2">
                        {order.receipts.map(r => (
                          <button
                            key={r.id}
                            onClick={() => setPreviewReceipt(r)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-sans border border-gray-200 rounded-lg text-gray-700 hover:border-gold-400 hover:text-gold-700 hover:bg-gold-50 transition-colors"
                          >
                            <ReceiptIcon size={13} />
                            {r.file_name ?? 'View Receipt'}
                            <Eye size={11} className="text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {order.admin_notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 font-sans">Admin Note</p>
                      <p className="text-sm text-amber-800 font-sans">{order.admin_notes}</p>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-sans">Update Status</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {STATUS_ACTIONS.map(({ status, label, icon, color }) => (
                        <button
                          key={status}
                          onClick={() => handleStatusClick(order, status, label)}
                          disabled={order.status === status}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-default ${
                            order.status === status
                              ? 'bg-gray-100 text-gray-400 border-gray-100'
                              : color
                          }`}
                        >
                          {icon}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Receipt Preview Modal */}
      {previewReceipt && (
        <ReceiptPreviewModal receipt={previewReceipt} onClose={() => setPreviewReceipt(null)} />
      )}

      {/* Confirm Dialog */}
      {pendingAction && (
        <ConfirmDialog
          title={
            pendingAction.newStatus === 'rejected'
              ? 'Reject Order & Remove RSVP'
              : pendingAction.restoreRsvp
              ? 'Approve Order & Restore RSVP'
              : `Confirm: ${pendingAction.label}`
          }
          message={
            pendingAction.newStatus === 'rejected'
              ? 'This will reject the order and automatically remove the customer from the RSVP list. This action cannot be undone.'
              : pendingAction.restoreRsvp
              ? 'This will approve the order and automatically restore the customer to the RSVP list if they are not already on it.'
              : `Are you sure you want to update this order status to "${pendingAction.newStatus}"?`
          }
          confirmLabel={
            pendingAction.newStatus === 'rejected'
              ? 'Reject & Remove RSVP'
              : pendingAction.restoreRsvp
              ? 'Approve & Restore RSVP'
              : pendingAction.label
          }
          variant={pendingAction.newStatus === 'rejected' ? 'danger' : 'default'}
          loading={confirmLoading}
          onConfirm={confirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
