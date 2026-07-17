'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, StickyNote, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminSession } from '@/lib/useAdminSession';
import TabHeader from '../TabHeader';
import NoteCard from './NoteCard';
import NoteEditModal from './NoteEditModal';

export default function NotesTab() {
  const { isAdmin } = useAdminSession();
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('সব');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  async function loadAll() {
    setLoading(true);
    const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    const channel = supabase
      .channel('notes-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => loadAll())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // অ্যাডমিন সব দেখে, পাবলিক ভিউয়ার শুধু visibility='public' দেখে
  // (RLS-ও এটাই নিশ্চিত করে — এটা শুধু UI-লেভেল ডাবল-চেক)
  const visibleItems = useMemo(
    () => (isAdmin ? items : items.filter((it) => it.visibility === 'public')),
    [items, isAdmin]
  );

  const folders = useMemo(() => ['সব', ...new Set(visibleItems.map((it) => it.folder))], [visibleItems]);
  const folderOptions = useMemo(() => [...new Set(items.map((it) => it.folder))], [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleItems.filter((it) => {
      const matchesFolder = folder === 'সব' || it.folder === folder;
      const matchesQuery = !q || [it.title, it.content].join(' ').toLowerCase().includes(q);
      return matchesFolder && matchesQuery;
    });
  }, [visibleItems, query, folder]);

  async function handleDelete(item) {
    if (!confirm(`"${item.title}" মুছে ফেলতে চাও?`)) return;
    if (item.file_url) await supabase.storage.from('notes-files').remove([item.file_url]);
    await supabase.from('notes').delete().eq('id', item.id);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <TabHeader icon={StickyNote} title="নোট ও ফাইল" subtitle="ফোল্ডার ও প্রাইভেসি সহ ব্যক্তিগত সংরক্ষণ" />
      <div className="mb-3 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-night-700/70 bg-night-800/70 px-4 py-2.5 backdrop-blur-sm">
          <Search size={16} className="shrink-0 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="শিরোনাম বা বিস্তারিত দিয়ে খোঁজো..."
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
            <Plus size={15} /> নোট
          </button>
        )}
      </div>

      <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto">
        {folders.map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              folder === f
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
            {visibleItems.length === 0 ? 'এখনো কোনো নোট যোগ করা হয়নি।' : 'কিছু খুঁজে পাওয়া যায়নি।'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((item) => (
          <NoteCard
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
        <NoteEditModal
          item={editing}
          folders={folderOptions}
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
