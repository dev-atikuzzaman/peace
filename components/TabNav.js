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
    <nav className="sticky bottom-0 z-30 border-t border-night-700/70 bg-night-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl px-2 py-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className="flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              <span
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors ${
                  isActive ? 'bg-gradient-to-r from-emerald/20 to-gold/20' : ''
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={isActive ? 'text-emerald-soft' : 'text-ink-500'}
                />
              </span>
              <span className={`font-bengali text-[10.5px] ${isActive ? 'font-semibold text-gold-soft' : 'text-ink-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
