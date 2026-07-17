'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, ScrollText, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminSession } from '@/lib/useAdminSession';
import TabHeader from '../TabHeader';
import HadithCard from './HadithCard';
import HadithEditModal from './HadithEditModal';

const FILTERS = ['সব', 'অপরিহার্য', 'গুরুত্বপূর্ণ', 'মাঝারি'];

export default function HadithTab() {
  const { isAdmin } = useAdminSession();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('সব');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  async function loadAll() {
    setLoading(true);
    const { data } = await supabase.from('hadith_topics').select('*').order('created_at');
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    const channel = supabase
      .channel('hadith-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hadith_topics' }, () => loadAll())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesFilter = filter === 'সব' || it.importance_tag === filter;
      const matchesQuery =
        !q || [it.topic_bn, it.hadith_text_bn, it.reference].join(' ').toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [items, query, filter]);

  async function handleDelete(item) {
    if (!confirm(`"${item.topic_bn}" মুছে ফেলতে চাও?`)) return;
    await supabase.from('hadith_topics').delete().eq('id', item.id);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <TabHeader icon={ScrollText} title="হাদীস" subtitle="৮০/২০ নীতিতে সবচেয়ে গুরুত্বপূর্ণ হাদীস" />
      <div className="mb-3 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-night-700/70 bg-night-800/70 px-4 py-2.5 backdrop-blur-sm">
          <Search size={16} className="shrink-0 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="বিষয় বা হাদীস দিয়ে খোঁজো..."
            className="w-full bg-transparent font-bengali text-sm text-ink-100 outline-none placeholder:text-ink-500"
          />
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditing(null);
              setShowEditor(true);
            }}
            className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-emerald to-gold px-4 py-2.5 text-xs font-semibold text-night-950 shadow-lg shadow-black/30"
          >
            <Plus size={15} /> হাদীস
          </button>
        )}
      </div>

      <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-gradient-to-r from-emerald to-gold text-night-950 shadow-md shadow-black/20'
                : 'border border-night-700 text-ink-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="py-10 text-center text-sm text-ink-500">লোড হচ্ছে...</p>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-night-700 px-4 py-10 text-center">
          <p className="font-bengali text-sm text-ink-500">
            {items.length === 0 ? 'এখনো কোনো হাদীস যোগ করা হয়নি।' : 'কিছু খুঁজে পাওয়া যায়নি।'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((item) => (
          <HadithCard
            key={item.id}
            item={item}
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
        <HadithEditModal
          item={editing}
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
