import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    const isProtected =
        pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

    if (isProtected && !session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        loginUrl.searchParams.set("reason", "unauthenticated");
        return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && session?.role !== "ADMIN") {
        const forbiddenUrl = new URL("/dashboard", request.url);
        forbiddenUrl.searchParams.set("error", "forbidden_admin");
        return NextResponse.redirect(forbiddenUrl);
    }

    if (pathname === "/login" && session) {
        const target = session.role === "ADMIN" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(target, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/dashboard/:path*", "/admin/:path*"],
};