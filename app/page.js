'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import TabNav from '@/components/TabNav';
import QuranTab from '@/components/quran/QuranTab';
import NamesTab from '@/components/names/NamesTab';
import HadithTab from '@/components/hadith/HadithTab';
import NotesTab from '@/components/notes/NotesTab';

export default function Home() {
  const [active, setActive] = useState('quran');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pb-4">
        {active === 'quran' && <QuranTab />}
        {active === 'names' && <NamesTab />}
        {active === 'hadith' && <HadithTab />}
        {active === 'notes' && <NotesTab />}
      </main>

      <TabNav active={active} onChange={setActive} />
    </div>
  );
}

