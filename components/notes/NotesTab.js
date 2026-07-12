'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminSession } from '@/lib/useAdminSession';
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
      <div className="mb-3 flex items-center gap-2">
        <div className="flex-1 rounded-xl border border-night-700 bg-night-800 px-3.5 py-2.5">
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
            className="flex shrink-0 items-center gap-1 rounded-xl bg-emerald px-3 py-2.5 text-xs font-semibold text-night-950"
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
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${
              folder === f ? 'border-emerald-soft bg-emerald-soft/10 text-emerald-soft' : 'border-night-700 text-ink-500'
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
