'use client';

import { Pencil, Trash2 } from 'lucide-react';
import ShareButton from '../quran/ShareButton';

export default function NameCard({ item, isAdmin, onEdit, onDelete }) {
  const shareText = `${item.serial_no}. ${item.name_arabic} (${item.name_english}) — ${item.name_bengali}\n${item.meaning_bn}\n${item.significance_bn}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-night-700/70 bg-night-800/70 backdrop-blur-md">
      <div className="relative bg-gradient-to-br from-emerald-deep via-emerald to-gold/70 px-4 py-4">
        <div className="absolute inset-0 bg-star-pattern opacity-40" />
        <div className="relative flex items-start justify-between gap-2">
          <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium text-white">
            #{item.serial_no}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <ShareButton getText={() => shareText} />
            {isAdmin && (
              <>
                <button onClick={() => onEdit(item)} className="rounded-lg bg-black/20 p-1.5" aria-label="এডিট করো">
                  <Pencil size={14} className="text-white" />
                </button>
                <button onClick={() => onDelete(item)} className="rounded-lg bg-black/20 p-1.5" aria-label="মুছে ফেলো">
                  <Trash2 size={14} className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>
        <p className="font-arabic relative mt-2 text-right text-[28px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.25)]">
          {item.name_arabic}
        </p>
        <p className="relative mt-1 text-sm font-semibold text-white/90">{item.name_english}</p>
      </div>

      <div className="space-y-2.5 px-4 py-4">
        <div>
          <p className="font-bengali text-[11px] font-semibold uppercase tracking-wide text-ink-500">বাংলা নাম ও অর্থ</p>
          <p className="font-bengali text-[15px] text-ink-100">
            {item.name_bengali} — {item.meaning_bn}
          </p>
        </div>
        <div>
          <p className="font-bengali text-[11px] font-semibold uppercase tracking-wide text-ink-500">তাৎপর্য</p>
          <p className="font-bengali text-[14px] leading-relaxed text-ink-100">{item.significance_bn}</p>
        </div>
      </div>
    </div>
  );
}
