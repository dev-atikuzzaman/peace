'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getDeviceId } from '@/lib/deviceId';

export default function FavoriteButton({ ayahId }) {
  const [isFav, setIsFav] = useState(false);
  const deviceId = typeof window !== 'undefined' ? getDeviceId() : null;

  useEffect(() => {
    if (!deviceId) return;
    let active = true;

    supabase
      .from('favorites')
      .select('ayah_id')
      .eq('device_id', deviceId)
      .eq('ayah_id', ayahId)
      .maybeSingle()
      .then(({ data }) => active && setIsFav(Boolean(data)));

    const channel = supabase
      .channel(`fav-${ayahId}-${deviceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'favorites', filter: `ayah_id=eq.${ayahId}` },
        (payload) => {
          const row = payload.new?.device_id ? payload.new : payload.old;
          if (row?.device_id === deviceId) {
            setIsFav(payload.eventType !== 'DELETE');
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [ayahId, deviceId]);

  async function toggle() {
    if (!deviceId) return;
    if (isFav) {
      await supabase.from('favorites').delete().eq('device_id', deviceId).eq('ayah_id', ayahId);
    } else {
      await supabase.from('favorites').insert({ device_id: deviceId, ayah_id: ayahId });
    }
    setIsFav(!isFav);
  }

  return (
    <button
      onClick={toggle}
      aria-label={isFav ? 'ফেভারিট থেকে সরাও' : 'ফেভারিটে যোগ করো'}
      className="rounded-lg p-1.5 hover:bg-night-700/60"
    >
      <Star size={17} className={isFav ? 'fill-gold text-gold' : 'text-ink-500'} />
    </button>
  );
}
