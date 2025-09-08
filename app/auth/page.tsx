"use client";
import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin'|'signup'>('signup');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!supabaseBrowser) {
          setAuthLoading(false);
          return;
        }

        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (session) {
          router.push('/');
          return;
        }

        setAuthLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabaseBrowser?.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/');
      }
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => subscription.unsubscribe();
  }, [router]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      if (!supabaseBrowser) throw new Error('Supabase not initialized');

      let result;
      if (mode === 'signup') {
        result = await supabaseBrowser.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
      } else {
        result = await supabaseBrowser.auth.signInWithPassword({ email, password });
      }

      if (result.error) throw result.error;

      // For sign-in, redirect immediately
      if (mode === 'signin') {
        router.push('/');
        return;
      }

      // For sign-up, show success message and wait for email confirmation
      if (mode === 'signup' && !result.data.user?.email_confirmed_at) {
        setError('Please check your email and click the confirmation link to complete your registration.');
      } else {
        router.push('/');
      }
    } catch (e:any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handle} className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">{mode === 'signup' ? 'Create account' : 'Sign in'}</h1>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"
          className="w-full border rounded px-3 py-2" required />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"
          className="w-full border rounded px-3 py-2" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full py-2 bg-black text-white rounded disabled:opacity-50">
          {loading ? 'Please wait…' : (mode === 'signup' ? 'Sign up' : 'Sign in')}
        </button>
        <button type="button" className="w-full text-sm text-gray-600" onClick={()=>setMode(m => m==='signup'?'signin':'signup')}>
          {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  );
}


