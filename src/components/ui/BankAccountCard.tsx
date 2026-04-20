import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { BankAccount } from '../../lib/types';

interface Props {
  account: BankAccount;
}

export default function BankAccountCard({ account }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(account.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dark-950 border border-gold-700/40 p-6 rounded-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-400 mb-3 font-semibold">{account.label}</p>
          <p className="font-serif text-xl text-white mb-1">{account.bank_name}</p>
          <p className="font-sans text-2xl font-light tracking-widest text-gold-300 my-2">{account.account_number}</p>
          <p className="font-sans text-sm text-cream-200/70">{account.account_name}</p>
          <p className="font-sans text-xs text-cream-200/40 mt-1">{account.currency}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-2.5 bg-gold-700/20 hover:bg-gold-700/40 text-gold-400 transition-colors rounded-sm"
          title="Copy account number"
        >
          {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
