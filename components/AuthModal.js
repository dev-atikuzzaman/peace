'use client';

import { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminSession } from '@/lib/useAdminSession';

export default function AuthModal({ onClose }) {
  const { adminExists } = useAdminSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isSignupMode = adminExists === false;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    if (isSignupMode) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      setBusy(false);
      if (signUpError) return setError(signUpError.message);
      setNotice('ইমেইলে পাঠানো লিংকে ক্লিক করে ভেরিফাই করো, তারপর লোগোতে ট্যাপ করে পাসওয়ার্ড দিয়ে ঢুকে যাও।');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) return setError('ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl border border-night-700 bg-night-800 p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bengali text-base font-semibold text-ink-100">
            {isSignupMode ? 'অ্যাডমিন হিসেবে সাইন-আপ' : 'অ্যাডমিন লগ-ইন'}
          </h2>
          <button onClick={onClose} aria-label="বন্ধ করো" className="rounded-lg p-1 text-ink-500 hover:bg-night-700">
            <X size={18} />
          </button>
        </div>

        {isSignupMode && (
          <p className="mb-4 rounded-lg bg-gold/10 px-3 py-2 text-xs text-gold-soft">
            এই অ্যাপে একজনই অ্যাডমিন থাকতে পারে। প্রথমবার সাইন-আপ করলেই তুমি স্থায়ীভাবে অ্যাডমিন হয়ে যাবে।
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-night-700 bg-night-900 px-3 py-2.5">
            <Mail size={16} className="text-ink-500" />
            <input
              type="email"
              required
              placeholder="ইমেইল"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-500"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-night-700 bg-night-900 px-3 py-2.5">
            <Lock size={16} className="text-ink-500" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="পাসওয়ার্ড"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-500"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {notice && <p className="text-xs text-emerald-soft">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald py-2.5 text-sm font-semibold text-night-950 active:opacity-80 disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {isSignupMode ? 'অ্যাডমিন হও' : 'প্রবেশ করো'}
          </button>
        </form>
      </div>
    </div>
  );
}
