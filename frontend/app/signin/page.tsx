'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || data.status === 'error') {
      setErr(data.message || 'Login failed');
      return;
    }
    router.push('/');
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Sign in</h1>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="mb-2" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="mb-2" />
      <button type="submit">Sign in</button>
      {err && <div className="text-red-600">{err}</div>}
    </form>
  );
}
