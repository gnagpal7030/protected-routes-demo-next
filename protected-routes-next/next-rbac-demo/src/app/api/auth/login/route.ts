import { NextResponse } from "next/server";
import {
    AUTH_COOKIE_NAME,
    authenticateUser,
    signSessionToken,
} from "@/lib/auth";

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: "Invalid request payload" },
            { status: 400 }
        );
    }

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json(
            { message: "Invalid request payload" },
            { status: 400 }
        );
    }

    const email = "email" in body && typeof body.email === "string" ? body.email : "";
    const password =
        "password" in body && typeof body.password === "string" ? body.password : "";

    const user = authenticateUser(email, password);
    if (!user) {
        return NextResponse.json(
            { message: "Invalid email or password" },
            { status: 401 }
        );
    }

    const token = await signSessionToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    });

    const response = NextResponse.json({
        message: "Login successful",
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        token,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 2,
    });

    return response;
}