'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Plus, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function NoteEditModal({ item, folders, onClose, onSaved }) {
  const [form, setForm] = useState({
    folder: 'সাধারণ',
    title: '',
    content: '',
    visibility: 'admin',
    file_url: '',
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) setForm(item);
  }, [item]);

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    let filePath = form.file_url || '';

    if (file) {
      const folderPrefix = form.visibility === 'public' ? 'public' : 'private';
      const cleanName = file.name.replace(/[^\w.\-]/g, '_');
      filePath = `${folderPrefix}/${crypto.randomUUID()}-${cleanName}`;
      const { error: upErr } = await supabase.storage.from('notes-files').upload(filePath, file);
      if (upErr) {
        setBusy(false);
        return setError(`ফাইল আপলোড ব্যর্থ: ${upErr.message}`);
      }
    }

    const payload = {
      folder: form.folder || 'সাধারণ',
      title: form.title,
      content: form.content,
      visibility: form.visibility,
      file_url: filePath,
    };

    const query = item
      ? supabase.from('notes').update(payload).eq('id', item.id)
      : supabase.from('notes').insert(payload);

    const { error: err } = await query;
    setBusy(false);
    if (err) return setError(err.message);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-night-700 bg-night-800 p-5 sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bengali text-base font-semibold text-ink-100">
            {item ? 'নোট এডিট করো' : 'নতুন নোট যোগ করো'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-night-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <Label>ফোল্ডার</Label>
            <input
              list="folder-list"
              value={form.folder}
              onChange={(e) => set('folder', e.target.value)}
              className="font-bengali w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-sm text-ink-100"
            />
            <datalist id="folder-list">
              {folders.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>

          <div>
            <Label>শিরোনাম</Label>
            <input
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="font-bengali w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-sm text-ink-100"
            />
          </div>

          <div>
            <Label>বিস্তারিত</Label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              className="font-bengali w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-sm text-ink-100"
            />
          </div>

          <div>
            <Label>প্রাইভেসি</Label>
            <div className="flex gap-2">
              {[
                { key: 'admin', label: 'শুধু অ্যাডমিন' },
                { key: 'public', label: 'পাবলিক' },
              ].map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => set('visibility', v.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    form.visibility === v.key
                      ? 'border-emerald-soft bg-emerald-soft/10 text-emerald-soft'
                      : 'border-night-700 text-ink-500'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>ফাইল সংযুক্ত করো (ঐচ্ছিক)</Label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-night-700 px-3 py-2.5 text-xs text-ink-500">
              <Upload size={14} />
              {file ? file.name : form.file_url ? 'নতুন ফাইল বেছে নিলে আগেরটা প্রতিস্থাপিত হবে' : 'ফাইল বেছে নাও'}
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald py-2.5 text-sm font-semibold text-night-950 disabled:opacity-60"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {item ? 'পরিবর্তন সংরক্ষণ করো' : 'যোগ করো'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Label({ children }) {
  return <p className="mb-1 font-bengali text-[11px] font-medium text-ink-500">{children}</p>;
}
