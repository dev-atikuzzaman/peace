'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import TabNav from '@/components/TabNav';
import QuranTab from '@/components/quran/QuranTab';
import ComingSoonTab from '@/components/ComingSoonTab';

export default function Home() {
  const [active, setActive] = useState('quran');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pb-4">
        {active === 'quran' && <QuranTab />}
        {active === 'names' && (
          <ComingSoonTab
            title="আল্লাহর ৯৯ নাম"
            note="এটা Phase 3-এ যোগ হবে — আরবি, ইংরেজি, বাংলা অর্থ ও তাৎপর্য সহ।"
          />
        )}
        {active === 'hadith' && (
          <ComingSoonTab
            title="হাদীস (৮০/২০)"
            note="এটা Phase 4-এ যোগ হবে — বিষয়ভিত্তিক হাদীস রেফারেন্সসহ।"
          />
        )}
        {active === 'notes' && (
          <ComingSoonTab
            title="নোট ও ফাইল"
            note="এটা Phase 4-এ যোগ হবে — ফোল্ডার ও প্রাইভেসি সহ।"
          />
        )}
      </main>

      <TabNav active={active} onChange={setActive} />
    </div>
  );
}
