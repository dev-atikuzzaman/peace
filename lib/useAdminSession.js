'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [session, setSession] = useState(null);
  const [adminUserId, setAdminUserId] = useState(undefined); // undefined = লোড হচ্ছে, null = কোনো অ্যাডমিন নেই
  const [loading, setLoading] = useState(true);

  const refreshConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from('app_config')
      .select('admin_user_id')
      .single();
    if (!error) setAdminUserId(data?.admin_user_id ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    refreshConfig().finally(() => mounted && setLoading(false));

    // app_config বদলালে (যেমন প্রথম অ্যাডমিন সাইন-আপ করার পর) সাথে সাথে সবার UI আপডেট হবে
    const channel = supabase
      .channel('app_config_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_config' },
        () => refreshConfig()
      )
      .subscribe();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [refreshConfig]);

  const isAdmin = Boolean(session?.user?.id && adminUserId && session.user.id === adminUserId);
  const adminExists = adminUserId !== undefined && adminUserId !== null;

  const value = {
    session,
    isAdmin,
    adminExists,
    loading,
    signOut: () => supabase.auth.signOut(),
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminSession() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminSession must be used inside <AdminProvider>');
  return ctx;
}
