'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const emptyForm = {
  surah_id: '',
  ayah_number: '',
  arabic_text: '',
  transliteration_bn: '',
  meaning_bn: '',
  meaning_en: '',
  tafsir_bn: '',
  related_hadith: '',
};

export default function VerseEditModal({ verse, surahs, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [newSurah, setNewSurah] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (verse) {
      setForm({
        surah_id: verse.surah_id,
        ayah_number: verse.ayah_number,
        arabic_text: verse.arabic_text || '',
        transliteration_bn: verse.transliteration_bn || '',
        meaning_bn: verse.meaning_bn || '',
        meaning_en: verse.meaning_en || '',
        tafsir_bn: verse.tafsir_bn || '',
        related_hadith: verse.related_hadith || '',
      });
    }
  }, [verse]);

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    let surahId = form.surah_id;

    if (surahId === '__new__') {
      if (!newSurah?.number || !newSurah?.name_bengali) {
        setBusy(false);
        return setError('নতুন সূরার নম্বর ও বাংলা নাম দাও।');
      }
      const { data, error: surahErr } = await supabase
        .from('surahs')
        .insert({
          number: Number(newSurah.number),
          name_arabic: newSurah.name_arabic || '',
          name_bengali: newSurah.name_bengali,
          name_english: newSurah.name_english || '',
          meaning: newSurah.meaning || '',
          total_ayahs: newSurah.total_ayahs ? Number(newSurah.total_ayahs) : null,
        })
        .select()
        .single();
      if (surahErr) {
        setBusy(false);
        return setError(surahErr.message);
      }
      surahId = data.id;
    }

    const payload = {
      surah_id: Number(surahId),
      ayah_number: Number(form.ayah_number),
      arabic_text: form.arabic_text,
      transliteration_bn: form.transliteration_bn,
      meaning_bn: form.meaning_bn,
      meaning_en: form.meaning_en,
      tafsir_bn: form.tafsir_bn,
      related_hadith: form.related_hadith,
      updated_at: new Date().toISOString(),
    };

    const query = verse
      ? supabase.from('ayahs').update(payload).eq('id', verse.id)
      : supabase.from('ayahs').insert(payload);

    const { error: saveErr } = await query;
    setBusy(false);
    if (saveErr) return setError(saveErr.message);
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
            {verse ? 'আয়াত এডিট করো' : 'নতুন আয়াত যোগ করো'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-night-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <Label>সূরা</Label>
            <select
              required
              value={form.surah_id}
              onChange={(e) => set('surah_id', e.target.value)}
              className="w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-sm text-ink-100"
            >
              <option value="" disabled>
                সূরা বেছে নাও
              </option>
              {surahs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number}. {s.name_bengali}
                </option>
              ))}
              <option value="__new__">+ নতুন সূরা যোগ করো</option>
            </select>
          </div>

          {form.surah_id === '__new__' && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-dashed border-night-700 p-3">
              <Field placeholder="সূরা নং" onChange={(v) => setNewSurah((s) => ({ ...s, number: v }))} />
              <Field placeholder="বাংলা নাম" onChange={(v) => setNewSurah((s) => ({ ...s, name_bengali: v }))} />
              <Field placeholder="আরবি নাম" onChange={(v) => setNewSurah((s) => ({ ...s, name_arabic: v }))} />
              <Field placeholder="ইংরেজি নাম" onChange={(v) => setNewSurah((s) => ({ ...s, name_english: v }))} />
              <Field placeholder="অর্থ" onChange={(v) => setNewSurah((s) => ({ ...s, meaning: v }))} />
              <Field placeholder="মোট আয়াত" onChange={(v) => setNewSurah((s) => ({ ...s, total_ayahs: v }))} />
            </div>
          )}

          <div>
            <Label>আয়াত নং</Label>
            <input
              required
              type="number"
              min="1"
              value={form.ayah_number}
              onChange={(e) => set('ayah_number', e.target.value)}
              className="w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-sm text-ink-100"
            />
          </div>

          <div>
            <Label>আরবি আয়াত</Label>
            <textarea
              required
              dir="rtl"
              rows={2}
              value={form.arabic_text}
              onChange={(e) => set('arabic_text', e.target.value)}
              className="font-arabic w-full rounded-xl border border-night-700 bg-night-900 px-3 py-2.5 text-lg text-ink-100"
            />
          </div>

          <Textarea label="বাংলা উচ্চারণ" value={form.transliteration_bn} onChange={(v) => set('transliteration_bn', v)} />
          <Textarea label="বাংলা অর্থ" value={form.meaning_bn} onChange={(v) => set('meaning_bn', v)} />
          <Textarea label="English Meaning" value={form.meaning_en} onChange={(v) => set('meaning_en', v)} />
          <Textarea
            label="তরজমা / ব্যাখ্যা / প্রেক্ষাপট (রেফারেন্সসহ)"
            value={form.tafsir_bn}
            onChange={(v) => set('tafsir_bn', v)}
            rows={4}
          />
          <Textarea
            label="সংশ্লিষ্ট হাদীস (রেফারেন্সসহ)"
            value={form.related_hadith}
            onChange={(v) => set('related_hadith', v)}
            rows={4}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald py-2.5 text-sm font-semibold text-night-950 disabled:opacity-60"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {verse ? 'পরিবর্তন সংরক্ষণ করো' : 'যোগ করো'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Label({ children }) {
  return <p className="mb-1 font-bengali text-[11px] font-medium text-ink-500">{children}</p>;
}

function Field({ placeholder, onChange }) {
  return (
    <input
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-night-700 bg-night-900 px-2.5 py-2 text-xs text-ink-100 placeholder:text-ink-500"
    />
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
