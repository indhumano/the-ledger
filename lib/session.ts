import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function getUserId(req: NextRequest): Promise<number | null> {
    const session = req.cookies.get("session")?.value;
    if (!session) return null;
    try {
        const { payload } = await jwtVerify(
            session,
            new TextEncoder().encode(process.env.AUTH_SECRET)
        );
        return typeof payload.userId === "number" ? payload.userId : null;
    } catch {
        return null;
    }
}