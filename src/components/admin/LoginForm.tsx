'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import type { AdminUser } from '@/types';
import { Button, Field, TextInput } from './ui';

export default function LoginForm({ onSuccess }: { onSuccess: (admin: AdminUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.login(email.trim(), password);
      saveSession(res.token, res.expiresAt, res.admin);
      setPassword('');
      onSuccess(res.admin);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) setError('Too many attempts. Wait a minute and try again.');
      else setError(err instanceof ApiError ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
      <div className="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white">
          <ArrowLeft size={15} /> Back to site
        </Link>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl border border-accent/20 bg-accent/10">
            <Lock size={20} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Manage CV, posts, trips and career stories.</p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <Field label="Email">
              {(id) => (
                <TextInput
                  id={id}
                  type="email"
                  autoComplete="username"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
            </Field>
            <Field label="Password">
              {(id) => (
                <TextInput
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </Field>
            {error && (
              <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" loading={loading} disabled={!email || !password} className="w-full py-3">
              Sign in
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
