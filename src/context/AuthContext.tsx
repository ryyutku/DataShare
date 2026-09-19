// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseclient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      // Ensure a matching row exists in public.user (covers Google sign-in too)
      if (session?.user) {
        const { data: existing } = await supabase
          .from('user')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from('user').insert({
            id: session.user.id,
            username: session.user.email?.split('@')[0] ?? `user_${session.user.id.slice(0, 8)}`,
            email: session.user.email ?? '',
          });
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}