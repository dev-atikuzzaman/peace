'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import ShareButton from './ShareButton';

const SUBTABS = [
  { key: 'meaning', label: 'অর্থ', icon: '📖' },
  { key: 'translit', label: 'উচ্চারণ', icon: '🔤' },
  { key: 'tafsir', label: 'তাফসীর', icon: '💡' },
  { key: 'hadith', label: 'হাদীস', icon: '📿' },
];

export default function VerseCard({ verse, isAdmin, onEdit, onDelete }) {
  const [sub, setSub] = useState('meaning');
  const surah = verse.surahs;

  const citeLine = `— সূরা ${surah?.name_bengali} (${surah?.number}:${verse.ayah_number})`;

  return (
    <div className="overflow-hidden rounded-2xl border border-night-700/70 bg-night-800/70 backdrop-blur-md">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-emerald-deep via-emerald to-gold/70 px-4 pb-4 pt-4">
        <div className="absolute inset-0 bg-star-pattern opacity-40" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium text-white">
              সূরা {surah?.name_bengali}
            </span>
            <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium text-white">
              #{surah?.number}
            </span>
            <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium text-white">
              আয়াত {verse.ayah_number}
            </span>
          </div>
          <div className="relative flex shrink-0 items-center gap-1">
            <FavoriteButton ayahId={verse.id} />
            {isAdmin && (
              <>
                <button onClick={() => onEdit(verse)} className="rounded-lg bg-black/20 p-1.5" aria-label="এডিট করো">
                  <Pencil size={14} className="text-white" />
                </button>
                <button onClick={() => onDelete(verse)} className="rounded-lg bg-black/20 p-1.5" aria-label="মুছে ফেলো">
                  <Trash2 size={14} className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>

        <p className="font-arabic relative mt-4 text-right text-[26px] leading-[2.1] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.25)]">
          {verse.arabic_text}
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-night-700 px-2 pt-2">
        {SUBTABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={`whitespace-nowrap rounded-t-lg px-3 py-2 text-xs font-medium ${
              sub === t.key
                ? 'border-b-2 border-emerald-soft text-emerald-soft'
                : 'text-ink-500'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {sub === 'meaning' && (
          <div className="space-y-3">
            <Section
              label="বাংলা অর্থ"
              text={verse.meaning_bn}
              shareText={`${verse.meaning_bn}\n${citeLine}`}
            />
            <Section
              label="English Meaning"
              text={verse.meaning_en}
              shareText={`${verse.meaning_en}\n${citeLine}`}
            />
          </div>
        )}

        {sub === 'translit' && (
          <Section
            label="বাংলা উচ্চারণ"
            text={verse.transliteration_bn}
            shareText={`${verse.transliteration_bn}\n${citeLine}`}
          />
        )}

        {sub === 'tafsir' && (
          <Section
            label="তরজমা / ব্যাখ্যা / প্রেক্ষাপট"
            text={verse.tafsir_bn}
            shareText={`${verse.tafsir_bn}\n${citeLine}`}
          />
        )}

        {sub === 'hadith' && (
          <Section
            label="সংশ্লিষ্ট হাদীস"
            text={verse.related_hadith}
            shareText={`${verse.related_hadith}\n${citeLine}`}
          />
        )}
      </div>
    </div>
  );
}

function Section({ label, text, shareText }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="font-bengali text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          {label}
        </p>
        <ShareButton getText={() => shareText} />
      </div>
      <p className="font-bengali whitespace-pre-line text-[14px] leading-relaxed text-ink-100">
        {text?.trim() ? text : 'এখনো যোগ করা হয়নি।'}
      </p>
    </div>
  );
}
