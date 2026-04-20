import { COUNTRY_CODES } from '../../lib/utils';

interface Props {
  countryCode: string;
  localPhone: string;
  onCountryChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  error?: string;
  required?: boolean;
}

export default function PhoneInput({ countryCode, localPhone, onCountryChange, onPhoneChange, error, required }: Props) {
  return (
    <div>
      <label className="label">Phone Number{required && <span className="text-red-500 ml-1">*</span>}</label>
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={e => onCountryChange(e.target.value)}
          className="input-field w-36 flex-shrink-0"
        >
          {COUNTRY_CODES.map(c => (
            <option key={`${c.label}-${c.code}`} value={c.code}>
              {c.flag} {c.label} ({c.code})
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={localPhone}
          onChange={e => onPhoneChange(e.target.value)}
          placeholder="Phone number"
          required={required}
          className={`input-field flex-1 ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 font-sans">{error}</p>}
    </div>
  );
}
