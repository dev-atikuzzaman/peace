'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareButton({ getText, label }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = getText();
    if (navigator.share) {
      try {
        await navigator.share({ text, title: 'নূর-এ-হেদায়াহ' });
      } catch {
        // ব্যবহারকারী শেয়ার শীট বন্ধ করে দিলে কিছু করার দরকার নেই
      }
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleShare}
      aria-label={label || 'শেয়ার করো'}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-ink-500 hover:bg-night-700 hover:text-ink-100"
    >
      {copied ? <Check size={13} className="text-emerald-soft" /> : <Share2 size={13} />}
      {copied ? 'কপি হয়েছে' : 'শেয়ার'}
    </button>
  );
}
