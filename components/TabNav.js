'use client';

import { BookOpenText, Sparkles, ScrollText, StickyNote } from 'lucide-react';

export const TABS = [
  { key: 'quran', label: 'কুরআন', icon: BookOpenText },
  { key: 'names', label: '৯৯ নাম', icon: Sparkles },
  { key: 'hadith', label: 'হাদীস', icon: ScrollText },
  { key: 'notes', label: 'নোট', icon: StickyNote },
];

export default function TabNav({ active, onChange }) {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-night-700 bg-night-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
                isActive ? 'text-emerald-soft' : 'text-ink-500'
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="font-bengali">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
