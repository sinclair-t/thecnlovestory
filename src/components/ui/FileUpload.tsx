import { useRef, useState } from 'react';
import { UploadCloud, X, FileImage } from 'lucide-react';

interface Props {
  label?: string;
  accept?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
}

export default function FileUpload({ label = 'Upload Receipt', accept = 'image/*,.pdf', file, onChange, error, required }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onChange(dropped);
  };

  return (
    <div>
      {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded cursor-pointer transition-all duration-200 p-6 text-center
          ${dragging ? 'border-gold-500 bg-gold-50' : 'border-cream-300 hover:border-gold-400 bg-cream-50/50'}
          ${error ? 'border-red-400' : ''}`}
      >
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={e => onChange(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileImage size={20} className="text-gold-600 flex-shrink-0" />
            <span className="text-sm font-sans text-dark-700 truncate max-w-[200px]">{file.name}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = ''; }}
              className="text-dark-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud size={24} className="text-gold-500" />
            <p className="text-sm font-sans text-dark-500">
              <span className="text-gold-600 font-semibold">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-dark-400 font-sans">PNG, JPG, PDF up to 10MB</p>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 font-sans">{error}</p>}
    </div>
  );
}
