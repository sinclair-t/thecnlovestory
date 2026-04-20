import { supabase } from './supabase';

export const COUNTRY_CODES = [
  { label: 'Nigeria',       code: '+234', flag: '🇳🇬' },
  { label: 'Canada',        code: '+1',   flag: '🇨🇦' },
  { label: 'United States', code: '+1',   flag: '🇺🇸' },
];

export function normalizePhone(countryCode: string, localPhone: string): string {
  const cleaned = localPhone.replace(/\D/g, '');
  const code = countryCode.replace(/\D/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith(code)) return '+' + cleaned;
  const local = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return `+${code}${local}`;
}

export function formatCurrency(amount: number, currency = 'NGN'): string {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending:   'badge-pending',
    approved:  'badge-approved',
    rejected:  'badge-rejected',
    fulfilled: 'badge-fulfilled',
    shipped:   'badge-shipped',
  };
  return map[status] ?? 'badge-info';
}

export function truncate(str: string, max = 50): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
}

export async function uploadReceipt(
  file: File,
  folder: 'orders' | 'gifts'
): Promise<{ path: string; url: string } | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, file, { upsert: false });
  if (error || !data) return null;
  const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(data.path);
  return { path: data.path, url: urlData.publicUrl };
}

export async function findOrCreateGuest(params: {
  fullName: string;
  countryCode: string;
  localPhone: string;
  email?: string;
}): Promise<string | null> {
  const normalized = normalizePhone(params.countryCode, params.localPhone);
  if (!normalized) return null;

  const { data: existing } = await supabase
    .from('guests')
    .select('id')
    .eq('normalized_phone', normalized)
    .maybeSingle();

  if (existing) {
    await supabase.from('guests').update({
      full_name: params.fullName,
      updated_at: new Date().toISOString(),
    }).eq('id', existing.id);
    return existing.id;
  }

  const { data: created } = await supabase.from('guests').insert({
    full_name: params.fullName,
    normalized_phone: normalized,
    country_code: params.countryCode,
    local_phone: params.localPhone,
    email: params.email,
  }).select('id').maybeSingle();

  return created?.id ?? null;
}
