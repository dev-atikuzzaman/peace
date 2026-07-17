'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, BookOpenText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminSession } from '@/lib/useAdminSession';
import TabHeader from '../TabHeader';
import VerseSearchBar from './VerseSearchBar';
import VerseCard from './VerseCard';
import VerseEditModal from './VerseEditModal';

export default function QuranTab() {
  const { isAdmin } = useAdminSession();
  const [query, setQuery] = useState('');
  const [surahs, setSurahs] = useState([]);
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = বন্ধ, {} = নতুন, verse = এডিট
  const [showEditor, setShowEditor] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [{ data: surahRows }, { data: ayahRows }] = await Promise.all([
      supabase.from('surahs').select('*').order('number'),
      supabase
        .from('ayahs')
        .select('*, surahs(id, number, name_arabic, name_bengali, name_english)')
        .order('ayah_number'),
    ]);
    setSurahs(surahRows || []);
    setAyahs(ayahRows || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();

    const channel = supabase
      .channel('ayahs-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ayahs' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surahs' }, () => loadAll())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ayahs;
    return ayahs.filter((a) => {
      const haystack = [
        a.surahs?.name_bengali,
        a.surahs?.name_english,
        a.surahs?.name_arabic,
        String(a.surahs?.number),
        String(a.ayah_number),
        a.arabic_text,
        a.meaning_bn,
        a.meaning_en,
        a.transliteration_bn,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [ayahs, query]);

  async function handleDelete(verse) {
    if (!confirm(`সূরা ${verse.surahs?.name_bengali} আয়াত ${verse.ayah_number} মুছে ফেলতে চাও?`)) return;
    await supabase.from('ayahs').delete().eq('id', verse.id);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <TabHeader icon={BookOpenText} title="কুরআন" subtitle="আয়াত, তরজমা, তাফসীর ও সংশ্লিষ্ট হাদীস" />
      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1">
          <VerseSearchBar value={query} onChange={setQuery} />
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditing(null);
              setShowEditor(true);
            }}
            className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-emerald to-gold px-4 py-2.5 text-xs font-semibold text-night-950 shadow-lg shadow-black/30"
          >
            <Plus size={15} /> আয়াত
          </button>
        )}
      </div>

      {loading && <p className="py-10 text-center text-sm text-ink-500">লোড হচ্ছে...</p>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-night-700 px-4 py-10 text-center">
          <p className="font-bengali text-sm text-ink-500">
            {ayahs.length === 0
              ? 'এখনো কোনো আয়াত যোগ করা হয়নি।'
              : 'কোনো আয়াত খুঁজে পাওয়া যায়নি — অন্য শব্দ দিয়ে চেষ্টা করো।'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((verse) => (
          <VerseCard
            key={verse.id}
            verse={verse}
            isAdmin={isAdmin}
            onEdit={(v) => {
              setEditing(v);
              setShowEditor(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showEditor && (
        <VerseEditModal
          verse={editing}
          surahs={surahs}
          onClose={() => setShowEditor(false)}
          onSaved={() => {
            setShowEditor(false);
            loadAll();
          }}
        />
      )}
    </div>
  );
}
