import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type UserRole = "USER" | "ADMIN";

export interface SessionPayload extends JWTPayload {
    sub: string;
    email: string;
    name: string;
    role: UserRole;
}

const DEMO_USERS: Array<{
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
}> = [
        {
            id: "u-101",
            email: "user@demo.local",
            password: "User@123",
            name: "Riya Sharma",
            role: "USER",
        },
        {
            id: "a-201",
            email: "admin@demo.local",
            password: "Admin@123",
            name: "Vikram Malhotra",
            role: "ADMIN",
        },
    ];

export const AUTH_COOKIE_NAME = "demo_auth_token";

function getSecretKey(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return new TextEncoder().encode(secret);
}

export function authenticateUser(email: string, password: string) {
    return DEMO_USERS.find(
        (u) =>
            u.email.toLowerCase() === email.trim().toLowerCase() &&
            u.password === password
    );
}

export async function signSessionToken(payload: {
    sub: string;
    email: string;
    name: string;
    role: UserRole;
}): Promise<string> {
    return await new SignJWT({
        email: payload.email,
        name: payload.name,
        role: payload.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(payload.sub)
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(getSecretKey());
}

export async function verifySessionToken(
    token: string | undefined
): Promise<SessionPayload | null> {
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, getSecretKey());
        if (
            typeof payload.sub === "string" &&
            typeof payload.email === "string" &&
            typeof payload.name === "string" &&
            (payload.role === "USER" || payload.role === "ADMIN")
        ) {
            return payload as SessionPayload;
        }
        return null;
    } catch {
        return null;
    }
}