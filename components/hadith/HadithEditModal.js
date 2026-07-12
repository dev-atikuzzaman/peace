'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const TAGS = ['অপরিহার্য', 'গুরুত্বপূর্ণ', 'মাঝারি'];
const emptyForm = { topic_bn: '', hadith_text_bn: '', reference: '', importance_tag: 'গুরুত্বপূর্ণ' };

export default function HadithEditModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
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

    const payload = {
      topic_bn: form.topic_bn,
      hadith_text_bn: form.hadith_text_bn,
      reference: form.reference,
      importance_tag: form.importance_tag,
    };

    const query = item
      ? supabase.from('hadith_topics').update(payload).eq('id', item.id)
      : supabase.from('hadith_topics').insert(payload);

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
            {item ? 'হাদীস এডিট করো' : 'নতুন হাদীস যোগ করো'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-night-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <Label>বিষয় (টপিক)</Label>
            <input
              required
              value={form.topic_bn}
              onChange={(e) => set('topic_bn', e.target.value)}
              className="font-bengali w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-sm text-ink-100"
            />
          </div>
          <div>
            <Label>হাদীসের বাংলা মর্মার্থ</Label>
            <textarea
              required
              rows={4}
              value={form.hadith_text_bn}
              onChange={(e) => set('hadith_text_bn', e.target.value)}
              className="font-bengali w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-sm text-ink-100"
            />
          </div>
          <div>
            <Label>রেফারেন্স (গ্রন্থ ও হাদীস নং)</Label>
            <input
              required
              value={form.reference}
              onChange={(e) => set('reference', e.target.value)}
              placeholder="যেমন: সহীহ বুখারী, হাদীস নং ১"
              className="font-bengali w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-500"
            />
          </div>
          <div>
            <Label>গুরুত্বের মাত্রা</Label>
            <div className="flex gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('importance_tag', t)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    form.importance_tag === t
                      ? 'border-emerald-soft bg-emerald-soft/10 text-emerald-soft'
                      : 'border-night-700 text-ink-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
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
