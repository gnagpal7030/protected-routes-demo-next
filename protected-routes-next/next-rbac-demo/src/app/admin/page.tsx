import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminPage() {
    return (
        <Suspense
            fallback={
                <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
                    <p className="text-sm text-gray-600">Loading admin panel...</p>
                </main>
            }
        >
            <AdminContent />
        </Suspense>
    );
}

async function AdminContent() {
    const cookieStore = await cookies();
    const session = await verifySessionToken(
        cookieStore.get(AUTH_COOKIE_NAME)?.value
    );

    if (!session) {
        redirect("/login?redirect=/admin&reason=unauthenticated");
    }

    if (session.role !== "ADMIN") {
        redirect("/dashboard?error=forbidden_admin");
    }

    return (
        <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                        ROLE: {session.role}
                    </span>
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">
                        Admin Control Panel
                    </h1>
                    <p className="text-sm text-gray-600">
                        Authorized administrator: {session.name} ({session.email})
                    </p>
                </div>
                <LogoutButton />
            </div>

            <div className="mt-8 rounded-xl border border-purple-200 bg-purple-50/50 p-6">
                <h2 className="font-semibold text-gray-900">Admin Access Verified</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Your ADMIN session is authorized to view this page.
                </p>
                <Link
                    href="/dashboard"
                    className="mt-4 inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-800 hover:bg-gray-50"
                >
                    Back to /dashboard
                </Link>
            </div>
        </main>
    );
}