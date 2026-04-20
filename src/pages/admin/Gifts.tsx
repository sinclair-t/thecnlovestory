import { useEffect, useState, useCallback } from 'react';
import { Search, Eye, ChevronDown, ChevronUp, Import as SortAsc, Dessert as SortDesc, CheckCircle2, XCircle, Clock, Gift as GiftIcon, Filter, Receipt as ReceiptIcon, User, MessageSquare, Calendar, RefreshCw, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import StatusBadge from '../../components/ui/StatusBadge';
import ReceiptPreviewModal from '../../components/ui/ReceiptPreviewModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import type { Gift, Receipt } from '../../lib/types';

type GiftStatus = 'all' | 'pending' | 'approved' | 'rejected';
type SortField = 'created_at' | 'amount' | 'giver_name';
type SortDir = 'asc' | 'desc';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface PendingAction {
  giftId: string;
  newStatus: string;
  label: string;
}

const STATUS_ACTIONS: { status: string; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'pending',  label: 'Set Pending', icon: <Clock size={12} />,        color: 'text-amber-700 border-amber-200 hover:bg-amber-50' },
  { status: 'approved', label: 'Approve',     icon: <CheckCircle2 size={12} />, color: 'text-green-700 border-green-200 hover:bg-green-50' },
  { status: 'rejected', label: 'Reject',      icon: <XCircle size={12} />,      color: 'text-red-700 border-red-200 hover:bg-red-50' },
];

let toastId = 0;

export default function AdminGifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GiftStatus>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [{ data: giftsData, error: giftsErr }, { data: receiptsData, error: receiptsErr }] = await Promise.all([
        supabase
          .from('gifts')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('receipts')
          .select('*')
          .eq('reference_type', 'gift'),
      ]);
      if (giftsErr) throw giftsErr;
      if (receiptsErr) throw receiptsErr;
      const receiptsByGift = (receiptsData ?? []).reduce<Record<string, Receipt[]>>((acc, r) => {
        (acc[r.reference_id] ??= []).push(r as Receipt);
        return acc;
      }, {});
      const merged = (giftsData ?? []).map(g => ({ ...g, receipts: receiptsByGift[g.id] ?? [] }));
      setGifts(merged as Gift[]);
    } catch {
      addToast('error', 'Failed to load gift submissions. Please try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('admin-gifts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, () => { load(true); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, () => { load(true); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const handleStatusClick = (gift: Gift, newStatus: string, label: string) => {
    if (gift.status === newStatus) return;
    setPendingAction({ giftId: gift.id, newStatus, label });
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    setConfirmLoading(true);

    const { giftId, newStatus } = pendingAction;

    const { error } = await supabase
      .from('gifts')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', giftId);

    if (error) {
      addToast('error', 'Failed to update gift status.');
    } else {
      addToast('success', `Gift status updated to "${newStatus}".`);
    }

    setConfirmLoading(false);
    setPendingAction(null);
    setUpdating(giftId);
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

  const filtered = gifts
    .filter(g => {
      const matchStatus = statusFilter === 'all' || g.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        g.giver_name.toLowerCase().includes(q) ||
        g.normalized_phone.includes(q) ||
        (g.message ?? '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'created_at') cmp = a.created_at.localeCompare(b.created_at);
      else if (sortField === 'amount') cmp = (a.amount ?? 0) - (b.amount ?? 0);
      else if (sortField === 'giver_name') cmp = a.giver_name.localeCompare(b.giver_name);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const counts = {
    all: gifts.length,
    pending: gifts.filter(g => g.status === 'pending').length,
    approved: gifts.filter(g => g.status === 'approved').length,
    rejected: gifts.filter(g => g.status === 'rejected').length,
  };

  const totalApproved = gifts
    .filter(g => g.status === 'approved' && g.amount)
    .reduce((sum, g) => sum + (g.amount ?? 0), 0);

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
            <h1 className="text-2xl font-semibold text-gray-900 font-sans">Gift Records</h1>
            <p className="text-sm text-gray-500 font-sans mt-0.5">{gifts.length} total submissions</p>
          </div>
          <div className="flex items-center gap-3">
            {totalApproved > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <DollarSign size={14} className="text-green-600" />
                <span className="text-sm font-sans font-semibold text-green-700">{formatCurrency(totalApproved)} approved</span>
              </div>
            )}
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm font-sans text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
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
              placeholder="Search by name, phone, message..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-sans">Sort:</span>
            {([['created_at', 'Date'], ['amount', 'Amount'], ['giver_name', 'Name']] as [SortField, string][]).map(([f, l]) => (
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

      {/* Gifts List */}
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
            <GiftIcon size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="font-sans text-gray-400 text-sm">No gift submissions found.</p>
          </div>
        ) : filtered.map(gift => {
          const isExpanded = expanded.has(gift.id);
          const isUpdating = updating === gift.id;
          return (
            <div key={gift.id} className={`bg-white rounded-xl border transition-all duration-200 ${
              isUpdating ? 'opacity-60 pointer-events-none' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}>
              {/* Gift Header Row */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => toggleExpand(gift.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-sans font-semibold text-gray-900">{gift.giver_name}</span>
                    <StatusBadge status={gift.status} />
                    {gift.message && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-sans">
                        <MessageSquare size={10} /> Has message
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-sans flex-wrap">
                    <span className="flex items-center gap-1"><User size={11} />{gift.normalized_phone}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} />{formatDateTime(gift.created_at)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {gift.amount ? (
                    <p className="font-sans font-bold text-gray-900">{formatCurrency(gift.amount)}</p>
                  ) : (
                    <p className="font-sans text-xs text-gray-400 italic">Amount not disclosed</p>
                  )}
                  {gift.receipts && gift.receipts.length > 0 && (
                    <p className="text-xs text-gray-400 font-sans flex items-center justify-end gap-1 mt-0.5">
                      <ReceiptIcon size={10} /> Receipt attached
                    </p>
                  )}
                </div>
                <div className="text-gray-400 flex-shrink-0">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
                  {/* Message */}
                  {gift.message && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-sans">Message to Couple</p>
                      <div className="bg-gray-50 rounded-lg px-4 py-3 border-l-4 border-gold-300">
                        <p className="text-sm text-gray-700 font-sans italic leading-relaxed">"{gift.message}"</p>
                      </div>
                    </div>
                  )}

                  {/* Amount */}
                  {gift.amount && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 font-sans">Gift Amount</p>
                      <p className="text-lg font-bold text-gray-900 font-sans">{formatCurrency(gift.amount)}</p>
                    </div>
                  )}

                  {/* Receipts */}
                  {gift.receipts && gift.receipts.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-sans">Payment Receipt</p>
                      <div className="flex flex-wrap gap-2">
                        {gift.receipts.map(r => (
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
                  {gift.admin_notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 font-sans">Admin Note</p>
                      <p className="text-sm text-amber-800 font-sans">{gift.admin_notes}</p>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-sans">Update Status</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {STATUS_ACTIONS.map(({ status, label, icon, color }) => (
                        <button
                          key={status}
                          onClick={() => handleStatusClick(gift, status, label)}
                          disabled={gift.status === status}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-default ${
                            gift.status === status
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
          title={`Confirm: ${pendingAction.label}`}
          message={`Are you sure you want to update this gift submission status to "${pendingAction.newStatus}"?`}
          confirmLabel={pendingAction.label}
          variant={pendingAction.newStatus === 'rejected' ? 'danger' : 'default'}
          loading={confirmLoading}
          onConfirm={confirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
