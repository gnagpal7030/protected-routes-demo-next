"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function decodeJwtPayload(token: string) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = atob(base64);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectParam = searchParams.get("redirect");
    const reason = searchParams.get("reason");

    const [email, setEmail] = useState("user@demo.local");
    const [password, setPassword] = useState("User@123");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastToken, setLastToken] = useState<string>("");

    function fillPreset(role: "USER" | "ADMIN") {
        setError("");
        if (role === "ADMIN") {
            setEmail("admin@demo.local");
            setPassword("Admin@123");
        } else {
            setEmail("user@demo.local");
            setPassword("User@123");
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Login failed");
                return;
            }

            setLastToken(data.token || "");
            const destination =
                redirectParam && redirectParam.startsWith("/")
                    ? redirectParam
                    : data.user.role === "ADMIN"
                        ? "/admin"
                        : "/dashboard";

            router.push(destination);
            router.refresh();
        } catch {
            setError("Network error while signing in");
        } finally {
            setLoading(false);
        }
    }

    const decodedPayload = lastToken ? decodeJwtPayload(lastToken) : null;

    return (
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-8 px-6 py-12">
            <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Test role-based access for <span className="font-semibold">USER</span>{" "}
                        and <span className="font-semibold">ADMIN</span> routes.
                    </p>

                    {reason === "unauthenticated" && (
                        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                            You were redirected to login because that route requires authentication.
                        </div>
                    )}

                    {reason === "logged_out" && (
                        <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
                            Session cleared. Protected routes will now redirect back here.
                        </div>
                    )}

                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            onClick={() => fillPreset("USER")}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Fill User Account
                        </button>
                        <button
                            type="button"
                            onClick={() => fillPreset("ADMIN")}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Fill Admin Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                            />
                        </div>

                        {error && (
                            <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                    <h2 className="text-base font-semibold text-gray-900">
                        Last Issued JWT (Demo Inspector)
                    </h2>
                    <p className="mt-1 text-xs text-gray-600">
                        Also inspect cookies and network responses in Chrome DevTools.
                    </p>
                    {decodedPayload ? (
                        <div className="mt-4 space-y-3">
                            <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-emerald-300">
                                {JSON.stringify(decodedPayload, null, 2)}
                            </pre>
                            <p className="break-all rounded-lg border bg-white p-2.5 font-mono text-[11px] text-gray-700">
                                {lastToken}
                            </p>
                        </div>
                    ) : (
                        <p className="mt-4 text-xs text-gray-500">
                            Sign in to see decoded JWT claims here, or open DevTools &rarr;
                            Application / Network.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="p-8 text-sm">Loading login...</div>}>
            <LoginForm />
        </Suspense>
    );
}