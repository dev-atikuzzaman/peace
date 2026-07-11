'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminSession } from '@/lib/useAdminSession';

// Supabase/GoTrue থেকে আসা কমন এরর মেসেজগুলো বোধগম্য বাংলায় রূপান্তর করে।
// কোনো এরর অচেনা/খালি/অদ্ভুত শেপের (যেমন literally "{}") হলে একটা সহায়ক
// ফলব্যাক দেখায়, যাতে ইউজার কাঁচা JSON/অবজেক্ট না দেখে বসে থাকে।
function safeDump(err) {
  try {
    if (err instanceof Error) {
      return JSON.stringify(err, Object.getOwnPropertyNames(err));
    }
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function translateAuthError(err) {
  const raw = err?.message ?? (typeof err === 'string' ? err : '');
  const msg = raw.trim();
  const status = err?.status ? ` [status ${err.status}]` : '';
  const name = err?.name ? ` (${err.name})` : '';

  if (/already registered/i.test(msg)) return 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে — সাইন-ইন করো।';
  if (/at least 6 characters/i.test(msg)) return 'পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে।';
  if (/signups not allowed/i.test(msg)) return 'এই প্রজেক্টে নতুন সাইন-আপ বন্ধ করা আছে — Supabase Dashboard → Authentication → Sign In / Providers এ গিয়ে "Allow new user signups" চালু করো।';
  if (/invalid login credentials/i.test(msg)) return 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।';
  if (/email not confirmed/i.test(msg)) return 'ইমেইল এখনো ভেরিফাই করা হয়নি — ইমেইলে পাঠানো লিংকে ক্লিক করো।';
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return 'Supabase-এ সংযোগ করা যায়নি। NEXT_PUBLIC_SUPABASE_URL ঠিক আছে কিনা এবং ইন্টারনেট কানেকশন চেক করো।';
  }

  if (!msg || msg === '{}' || msg === '[object Object]') {
    return `Supabase থেকে বোধগম্য মেসেজ পাওয়া যায়নি${status}${name}। ডিবাগ: ${safeDump(err)} — এই পুরো লেখাটার স্ক্রিনশট Claude-কে পাঠাও, অথবা Supabase Dashboard → Logs → Postgres Logs এ (schema.sql এর on_auth_user_created ট্রিগার ফেইল করছে কিনা) চেক করো।`;
  }
  return msg + status;
}

export default function AuthModal({ onClose }) {
  const { adminExists } = useAdminSession();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // adminExists লোড হওয়ার পর সঠিক ডিফল্ট মোড বসানো
  useEffect(() => {
    setMounted(true);
    if (adminExists === false) setMode('signup');
  }, [adminExists]);

  if (!mounted) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) return setError(translateAuthError(err));
        // Confirm email বন্ধ থাকা প্রজেক্টে signUp সাথে সাথেই সেশন দিয়ে দেয়
        if (data?.session) {
          onClose();
          return;
        }
        setNotice('ইমেইলে পাঠানো লিংকে ক্লিক করে ভেরিফাই করো, তারপর লোগোতে ট্যাপ করে পাসওয়ার্ড দিয়ে ঢুকে যাও।');
        return;
      }

      if (mode === 'forgot') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        });
        if (err) return setError(translateAuthError(err));
        setNotice('পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে।');
        return;
      }

      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) return setError(translateAuthError(err));
      onClose();
    } catch (thrown) {
      // নেটওয়ার্ক/CORS জাতীয় সমস্যা এখানে ধরা পড়বে, ব্রাউজার কনসোলেও লগ হবে
      console.error('Auth error:', thrown);
      setError(translateAuthError(thrown));
    } finally {
      setBusy(false);
    }
  }

  const tabs = adminExists === false
    ? [{ key: 'signup', label: 'সাইন-আপ' }]
    : [
        { key: 'signin', label: 'সাইন-ইন' },
        { key: 'forgot', label: 'পাসওয়ার্ড ভুলে গেছেন?' },
      ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 px-0 sm:items-center sm:px-4">
      <div className="w-full max-w-sm rounded-t-3xl border border-emerald-deep/40 bg-gradient-to-b from-night-800 to-night-950 p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-start justify-between">
          <h2 className="font-display text-[26px] italic leading-none text-ink-100">
            অ্যাডমিন প্রবেশ
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করো"
            className="rounded-full p-1 text-emerald-soft/70 hover:bg-night-700"
          >
            <X size={20} />
          </button>
        </div>

        {tabs.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setMode(t.key);
                  setError('');
                  setNotice('');
                }}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                  mode === t.key
                    ? 'border-emerald-soft bg-emerald-soft/10 text-emerald-soft'
                    : 'border-night-700 text-ink-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {mode === 'signup' && (
          <p className="mb-4 rounded-xl bg-gold/10 px-3 py-2 text-xs text-gold-soft">
            এই অ্যাপে একজনই অ্যাডমিন থাকতে পারে। প্রথমবার সাইন-আপ করলেই তুমি স্থায়ীভাবে অ্যাডমিন হয়ে যাবে।
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-deep/40 bg-night-900/80 px-4 py-3">
            <Mail size={16} className="shrink-0 text-emerald-soft/70" />
            <input
              type="email"
              required
              placeholder="ইমেইল..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-500"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-deep/40 bg-night-900/80 px-4 py-3">
              <Lock size={16} className="shrink-0 text-emerald-soft/70" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="পাসওয়ার্ড..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-500"
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-400">
              {error}
            </p>
          )}
          {notice && <p className="text-xs text-emerald-soft">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-soft to-gold py-3 text-sm font-semibold text-night-950 active:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {mode === 'signup' && 'অ্যাডমিন হও'}
            {mode === 'signin' && 'সাইন ইন'}
            {mode === 'forgot' && 'রিসেট লিংক পাঠাও'}
          </button>
        </form>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-500">
          <ShieldCheck size={12} className="text-emerald-soft/70" />
          Real Supabase Auth — RLS দিয়ে সুরক্ষিত।
        </p>
      </div>
    </div>,
    document.body
  );
}

