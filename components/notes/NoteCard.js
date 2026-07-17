'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, Paperclip, Lock, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import ShareButton from '../quran/ShareButton';

export default function NoteCard({ item, isAdmin, onEdit, onDelete }) {
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    if (!item.file_url) return;
    let active = true;
    supabase.storage
      .from('notes-files')
      .createSignedUrl(item.file_url, 3600)
      .then(({ data }) => active && setFileUrl(data?.signedUrl || null));
    return () => {
      active = false;
    };
  }, [item.file_url]);

  const shareText = `${item.title}\n\n${item.content || ''}`;

  return (
    <div className="rounded-2xl border border-night-700/70 bg-night-800/70 p-4 shadow-lg shadow-black/20 backdrop-blur-md">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-night-700 px-2 py-0.5 text-[10px] font-medium text-ink-300">
            {item.folder}
          </span>
          {isAdmin && (
            <span className="flex items-center gap-1 rounded-full bg-night-700 px-2 py-0.5 text-[10px] font-medium text-ink-500">
              {item.visibility === 'public' ? <Globe size={10} /> : <Lock size={10} />}
              {item.visibility === 'public' ? 'পাবলিক' : 'অ্যাডমিন-ওনলি'}
            </span>
          )}
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

      <h3 className="font-bengali mb-1 text-[15px] font-semibold text-ink-100">{item.title}</h3>
      {item.content && (
        <p className="font-bengali whitespace-pre-line text-[14px] leading-relaxed text-ink-100">{item.content}</p>
      )}

      {item.file_url && (
        <a
          href={fileUrl || '#'}
          target="_blank"
          rel="noreferrer"
          className={`mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-night-700 px-2.5 py-1.5 text-xs text-emerald-soft ${
            !fileUrl ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <Paperclip size={12} /> {fileUrl ? 'ফাইল দেখো' : 'লোড হচ্ছে...'}
        </a>
      )}
    </div>
  );
}
