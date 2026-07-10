'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // অফলাইন সাপোর্ট ছাড়া স্বাভাবিকভাবেই অ্যাপ চলবে, তাই নীরবে ফেইল করাই ঠিক
      });
    }
  }, []);
  return null;
}
