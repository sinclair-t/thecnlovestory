import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && !loading) onConfirm();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel, onConfirm, loading]);

  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : variant === 'warning'
      ? 'bg-amber-500 hover:bg-amber-600 text-white'
      : 'bg-gray-800 hover:bg-gray-900 text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-start justify-between p-6 pb-0">
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-full flex-shrink-0 ${
              variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-amber-100' : 'bg-gray-100'
            }`}>
              <AlertTriangle size={20} className={
                variant === 'danger' ? 'text-red-600' : variant === 'warning' ? 'text-amber-600' : 'text-gray-600'
              } />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-gray-900 text-base">{title}</h3>
              <p className="font-sans text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0 ml-2">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-sans font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-sans font-medium rounded-lg transition-colors disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
