'use client';

import { Pencil, Trash2 } from 'lucide-react';
import ShareButton from '../quran/ShareButton';

const TAG_STYLE = {
  'অপরিহার্য': 'bg-red-500/15 text-red-300',
  'গুরুত্বপূর্ণ': 'bg-gold/15 text-gold-soft',
  'মাঝারি': 'bg-emerald-soft/15 text-emerald-soft',
};

export default function HadithCard({ item, isAdmin, onEdit, onDelete }) {
  const shareText = `${item.topic_bn}\n\n${item.hadith_text_bn}\n(${item.reference})`;
  const tagClass = TAG_STYLE[item.importance_tag] || 'bg-night-700 text-ink-500';

  return (
    <div className="rounded-2xl border border-night-700/70 bg-night-800/70 p-4 backdrop-blur-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bengali text-[15px] font-semibold text-ink-100">{item.topic_bn}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tagClass}`}>
            {item.importance_tag}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ShareButton getText={() => shareText} />
          {isAdmin && (
            <>
              <button onClick={() => onEdit(item)} className="rounded-lg p-1.5 hover:bg-night-700" aria-label="এডিট করো">
                <Pencil size={14} className="text-ink-500" />
              </button>
              <button onClick={() => onDelete(item)} className="rounded-lg p-1.5 hover:bg-night-700" aria-label="মুছে ফেলো">
                <Trash2 size={14} className="text-ink-500" />
              </button>
            </>
          )}
        </div>
      </div>
      <p className="font-bengali whitespace-pre-line text-[14px] leading-relaxed text-ink-100">
        {item.hadith_text_bn}
      </p>
      <p className="font-bengali mt-2 text-[12px] text-emerald-soft">({item.reference})</p>
    </div>
  );
}
