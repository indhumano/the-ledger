'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (!username.trim() || !password) {
            setError('Username and password are required.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password }),
            });

            if (res.ok) {
                console.log('Login successful');
                router.push('/');                
                return;
            }

            const body = await res.json().catch(() => ({}));
            setError(body?.error ?? 'Invalid credentials');
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left">
                    <img
                        src="/logo.png"
                        alt="The Ledger Logo"
                        className="w-40 h-auto"
                    />
                    <h1 className="text-5xl font-bold">Login now!</h1>
                    <p className="py-6">
                        The Budget Tracker and Planner for the Family. Track every rupee you spend!
                    </p>
                </div>
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                    <div className="card-body">
                        <form
                            onSubmit={handleSubmit}
                            aria-labelledby="login-heading"
                            className="w-full max-w-md bg-white p-6 rounded-lg shadow"
                        >

                            {error && (
                                <div
                                    role="alert"
                                    className="mb-3 text-sm text-red-800 bg-red-50 px-3 py-2 rounded"
                                >
                                    {error}
                                </div>
                            )}

                            <fieldset className="fieldset">
                                <label className="label">Username</label>
                                <input id="username"
                                    name="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                    className="input" placeholder="username" />
                                <label className="label">Password</label>
                                <input id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    className="input" placeholder="Password" />
                                {/*<div><a className="link link-hover">Forgot password?</a></div>*/}
                                <button type="submit"
                                    disabled={loading} className="btn btn-neutral mt-4">
                                    {loading ? 'Signing in' : 'Sign in'}
                                </button>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}