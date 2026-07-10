'use client';

import { Search } from 'lucide-react';

export default function VerseSearchBar({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-night-700 bg-night-800 px-3.5 py-2.5">
      <Search size={16} className="shrink-0 text-ink-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="সূরার নাম, আয়াত নং, আরবি বা অর্থ দিয়ে খোঁজো..."
        className="w-full bg-transparent font-bengali text-sm text-ink-100 outline-none placeholder:text-ink-500"
      />
    </div>
  );
}
