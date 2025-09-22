'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

import { useUserStore } from '@/stores/useUserStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useUserStore();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log("this is login");

    const success = await login(email, password);

    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Center the card perfectly on all screens */}
      <div className="mx-auto flex min-h-screen w-full max-w-none items-center justify-center px-4 py-8">
        <Card className="w-full max-w-sm rounded-3xl border-neutral-200/80 shadow-sm dark:border-neutral-800">
          <CardContent className="p-8">
            <div className='pb-5'>
              <Image
                src="/logo.png"
                alt="Logo"
                width={56}
                height={56}
                className="mx-auto mb-4 rounded-full shadow-sm"
              />

              <h1 className="text-center text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                The Hip Physio Admin Panel
              </h1>
            </div>

            <div className="mb-6 mt-2 text-center">
              <h2 className="text-2xl font-semibold">Sign in</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <p className="rounded-md bg-red-50 p-2 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
