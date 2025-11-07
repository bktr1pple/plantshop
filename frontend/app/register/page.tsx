'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.message || 'Error');
      return;
    }
    router.push('/signin');
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Register</h1>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="mb-2" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="mb-2" />
      <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" className="mb-2" />
      <button type="submit">Register</button>
      {err && <div className="text-red-600">{err}</div>}
    </form>
  );
}
