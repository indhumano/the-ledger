// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(req: NextRequest) {
    const session = req.cookies.get("session")?.value;
    if (!session) return NextResponse.redirect(new URL("/login", req.url));

    try {
        await jwtVerify(session, new TextEncoder().encode(process.env.AUTH_SECRET));
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        "/((?!login|api/login|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
    ]
};