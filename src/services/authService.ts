// src/services/authService.ts
import { supabase } from './supabaseclient';

export async function signUpWithEmail(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // Also create the matching row in your public `user` table
  if (data.user) {
    const { error: profileError } = await supabase.from('user').insert({
      id: data.user.id,
      username,
      email,
    });
    if (profileError) throw profileError;
  }

  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// 3. API: Sign In with Email & Password
export async function signInUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Sign in error:', error.message);
        throw error;
    }

    return data;
}