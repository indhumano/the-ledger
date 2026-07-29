//import bcrypt from "bcryptjs";
//import { SignJWT } from "jose";
//import { cookies } from "next/headers";
//import { prisma } from "@/lib/prisma";

//export async function POST(req: Request) {
//    const { username, password } = await req.json();
//    const user = await prisma.user.findUnique({ where: { username } });

//    console.log("User found:", user);
//    console.log("Username:", username);
//    console.log("Password:", password);

//    //if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
//    //    return Response.json({ error: "Invalid credentials" }, { status: 401 });
//    //}

//    // Plain password comparison
//    if (!user || user.passwordHash !== password) {
//        return Response.json(
//            { error: "Invalid credentials" },
//            { status: 401 }
//        );
//    }

//    const token = await new SignJWT({ userId: user.id, displayName: user.displayName })
//        .setProtectedHeader({ alg: "HS256" })
//        .setExpirationTime("30d")
//        .sign(new TextEncoder().encode(process.env.AUTH_SECRET));

//    const cookieStore = await cookies(); // must await in Next.js 15+/16
//    cookieStore.set("session", token, {
//        httpOnly: true,
//        secure: process.env.NODE_ENV === "production", // secure cookies require HTTPS
//        sameSite: "lax",
//        maxAge: 60 * 60 * 24 * 30,
//        path: "/",
//    });

//    return Response.json({ ok: true });
//}

import { prisma } from "@/lib/prisma";
import { NextResponse } from 'next/server';
import { SignJWT } from "jose";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        // 1. Find the user
        const user = await prisma.user.findFirst({
            where: {
                username,
                passwordHash: password, // Note: Consider using bcrypt/argon2 hashing in production
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // 2. Generate the JWT token matching your proxy.ts AUTH_SECRET
        const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
        const token = await new SignJWT({ userId: user.id, username: user.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1d') // Token validity duration
            .sign(secret);

        // 3. Create the response and attach the session cookie
        const response = NextResponse.json({ success: true });

        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return response;
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}