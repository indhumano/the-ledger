import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const month = req.nextUrl.searchParams.get("month"); // format: "2026-07"

    let where = {};
    if (month) {
        const [year, mon] = month.split("-").map(Number);
        const start = new Date(year, mon - 1, 1);
        const end = new Date(year, mon, 1);
        where = { date: { gte: start, lt: end } };
    }

    const income = await prisma.familyIncome.findMany({
        where,
        orderBy: { date: "desc" },
    });
    return NextResponse.json(income);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { source, amount, date } = body;

    if (!source?.trim()) {
        return NextResponse.json({ error: "Source is required" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    }

    const income = await prisma.familyIncome.create({
        data: {
            source: source.trim(),
            amount: Math.round(amount),
            date: date ? new Date(date) : new Date(),
        },
    });

    return NextResponse.json(income, { status: 201 });
}