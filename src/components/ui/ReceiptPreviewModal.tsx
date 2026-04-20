import { useEffect } from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import type { Receipt } from '../../lib/types';

interface Props {
  receipt: Receipt;
  onClose: () => void;
}

function isImage(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
}

export default function ReceiptPreviewModal({ receipt, onClose }: Props) {
  const url = receipt.file_url ?? '';
  const name = receipt.file_name ?? 'Receipt';
  const image = isImage(url);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-gray-400" />
            <span className="font-sans font-semibold text-gray-800 text-sm truncate max-w-xs">{name}</span>
          </div>
          <div className="flex items-center gap-2">
            {url && (
              <>
                <a
                  href={url}
                  download={name}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                  title="Download"
                >
                  <Download size={16} />
                </a>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} />
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-64 bg-gray-50">
          {!url ? (
            <div className="text-center text-gray-400 font-sans text-sm">
              <FileText size={40} className="mx-auto mb-3 opacity-40" />
              No preview available
            </div>
          ) : image ? (
            <img
              src={url}
              alt={name}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm"
            />
          ) : (
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-sans text-sm text-gray-500 mb-4">Preview not available for this file type.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-sans rounded-lg hover:bg-gray-900 transition-colors"
              >
                <ExternalLink size={14} />
                Open File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
