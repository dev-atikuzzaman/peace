'use client';

import { useState } from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAdminSession } from '@/lib/useAdminSession';
import AuthModal from './AuthModal';

function StarLogo({ className }) {
  // রুব-এল-হিজব ধাঁচের আট-কোণা তারা — অ্যাপের একমাত্র "লুকানো" এন্ট্রি পয়েন্ট (অ্যাডমিন লগ-ইন/সাইন-আপ)
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <path
        d="M24 3 L29 17 L44 17 L32 26 L37 41 L24 32 L11 41 L16 26 L4 17 L19 17 Z"
        fill="url(#g)"
        stroke="#0e7a8f"
        strokeWidth="1.5"
      />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="#2bd9ac" />
          <stop offset="1" stopColor="#f5b942" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Header() {
  const { isAdmin, session, loading, signOut } = useAdminSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-night-700/70 bg-night-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <button
          onClick={() => (isAdmin ? setMenuOpen((v) => !v) : !loading && setModalOpen(true))}
          className="flex items-center gap-2.5 rounded-lg py-1 pr-2 active:opacity-70"
          aria-label={isAdmin ? 'অ্যাডমিন মেনু' : 'অ্যাডমিন প্রবেশ'}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald/15 to-gold/15 p-1.5 shadow-lg shadow-black/30">
            <StarLogo className="h-full w-full" />
          </span>
          <div className="text-left">
            <p className="font-display text-[17px] font-semibold italic leading-tight text-ink-100">
              নূর-এ-হেদায়াহ
            </p>
            <p className="font-bengali text-[10.5px] leading-tight text-ink-500">কুরআন ও হাদীস রেফারেন্স</p>
          </div>
        </button>

        {isAdmin && (
          <span className="flex items-center gap-1 rounded-xl bg-night-800 px-2.5 py-2 text-[11px] font-medium text-emerald-soft shadow-md shadow-black/20">
            <ShieldCheck size={14} /> অ্যাডমিন
          </span>
        )}
      </div>

      {isAdmin && menuOpen && (
        <div className="absolute left-4 top-[62px] w-56 rounded-xl border border-night-700 bg-night-800 p-2 shadow-2xl">
          <p className="truncate px-2 py-1.5 text-xs text-ink-500">{session.user.email}</p>
          <button
            onClick={() => {
              signOut();
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-ink-100 hover:bg-night-700"
          >
            <LogOut size={15} /> লগ-আউট
          </button>
        </div>
      )}

      {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
    </header>
  );
}

