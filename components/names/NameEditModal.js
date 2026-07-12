'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const emptyForm = {
  serial_no: '',
  name_arabic: '',
  name_english: '',
  name_bengali: '',
  meaning_bn: '',
  significance_bn: '',
};

export default function NameEditModal({ item, onClose, onSaved }) {
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
      serial_no: Number(form.serial_no),
      name_arabic: form.name_arabic,
      name_english: form.name_english,
      name_bengali: form.name_bengali,
      meaning_bn: form.meaning_bn,
      significance_bn: form.significance_bn,
    };

    const query = item
      ? supabase.from('asma_ul_husna').update(payload).eq('id', item.id)
      : supabase.from('asma_ul_husna').insert(payload);

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
            {item ? 'নাম এডিট করো' : 'নতুন নাম যোগ করো'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-night-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="ক্রম নং (১-৯৯)" type="number" value={form.serial_no} onChange={(v) => set('serial_no', v)} />
          <div>
            <Label>আরবি নাম</Label>
            <input
              required
              dir="rtl"
              value={form.name_arabic}
              onChange={(e) => set('name_arabic', e.target.value)}
              className="font-arabic w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-lg text-ink-100"
            />
          </div>
          <Field label="ইংরেজি (transliteration)" value={form.name_english} onChange={(v) => set('name_english', v)} />
          <Field label="বাংলা নাম" value={form.name_bengali} onChange={(v) => set('name_bengali', v)} />
          <Textarea label="বাংলা অর্থ" value={form.meaning_bn} onChange={(v) => set('meaning_bn', v)} />
          <Textarea label="তাৎপর্য" value={form.significance_bn} onChange={(v) => set('significance_bn', v)} rows={3} />

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

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-bengali w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-sm text-ink-100"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 2 }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-bengali w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-sm text-ink-100"
      />
    </div>
  );
}
