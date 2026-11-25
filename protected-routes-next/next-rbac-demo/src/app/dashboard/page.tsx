import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default function UserDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    return (
        <Suspense
            fallback={
                <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
                    <p className="text-sm text-gray-600">Loading dashboard...</p>
                </main>
            }
        >
            <DashboardContent searchParams={searchParams} />
        </Suspense>
    );
}

async function DashboardContent({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const cookieStore = await cookies();
    const session = await verifySessionToken(
        cookieStore.get(AUTH_COOKIE_NAME)?.value
    );

    if (!session) {
        redirect("/login?redirect=/dashboard&reason=unauthenticated");
    }

    const resolvedSearch = await searchParams;

    return (
        <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                        ROLE: {session.role}
                    </span>
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">
                        User Dashboard
                    </h1>
                    <p className="text-sm text-gray-600">
                        Signed in as {session.name} ({session.email})
                    </p>
                </div>
                <LogoutButton />
            </div>

            {resolvedSearch.error === "forbidden_admin" && session.role === "USER" && (
                <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    Access denied to <strong>/admin</strong>: your JWT role is{" "}
                    <strong>{session.role}</strong>, so you were redirected back to{" "}
                    <strong>/dashboard</strong>.
                </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-5">
                    <h2 className="font-semibold text-gray-900">Standard User Access</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        You can view user profile data and standard account actions.
                    </p>
                </div>
                <div className="rounded-xl border p-5">
                    <h2 className="font-semibold text-gray-900">Test Admin Route</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Try opening <code className="font-mono">/admin</code> to verify role
                        enforcement.
                    </p>
                    <Link
                        href="/admin"
                        className="mt-3 inline-block rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800"
                    >
                        Go to /admin
                    </Link>
                </div>
            </div>
        </main>
    );
}