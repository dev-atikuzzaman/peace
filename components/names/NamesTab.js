'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Sparkles, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminSession } from '@/lib/useAdminSession';
import TabHeader from '../TabHeader';
import NameCard from './NameCard';
import NameEditModal from './NameEditModal';

export default function NamesTab() {
  const { isAdmin } = useAdminSession();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  async function loadAll() {
    setLoading(true);
    const { data } = await supabase.from('asma_ul_husna').select('*').order('serial_no');
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    const channel = supabase
      .channel('names-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asma_ul_husna' }, () => loadAll())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.name_arabic, it.name_english, it.name_bengali, it.meaning_bn, it.significance_bn, String(it.serial_no)]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  async function handleDelete(item) {
    if (!confirm(`#${item.serial_no} ${item.name_bengali} মুছে ফেলতে চাও?`)) return;
    await supabase.from('asma_ul_husna').delete().eq('id', item.id);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <TabHeader icon={Sparkles} title="আল্লাহর ৯৯ নাম" subtitle="আরবি, বাংলা অর্থ ও তাৎপর্যসহ" />
      <div className="mb-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-night-700/70 bg-night-800/70 px-4 py-2.5 backdrop-blur-sm">
          <Search size={16} className="shrink-0 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম, অর্থ বা ক্রম নং দিয়ে খোঁজো..."
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
            <Plus size={15} /> নাম
          </button>
        )}
      </div>

      {loading && <p className="py-10 text-center text-sm text-ink-500">লোড হচ্ছে...</p>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-night-700 px-4 py-10 text-center">
          <p className="font-bengali text-sm text-ink-500">
            {items.length === 0 ? 'এখনো কোনো নাম যোগ করা হয়নি।' : 'কোনো নাম খুঁজে পাওয়া যায়নি।'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((item) => (
          <NameCard
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
        <NameEditModal
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
