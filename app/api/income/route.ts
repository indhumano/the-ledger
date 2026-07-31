import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const month = req.nextUrl.searchParams.get("month"); // format: "2026-07"

    const income = await prisma.familyIncome.findMany({
        where: month ? { month } : {},
        orderBy: { date: "desc" },
    });
    return NextResponse.json(income);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { source, amount, month } = body;

    if (!source?.trim()) {
        return NextResponse.json({ error: "Source is required" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    }
    if (!month) {
        return NextResponse.json({ error: "month is required" }, { status: 400 });
    }

    const income = await prisma.familyIncome.create({
        data: {
            source: source.trim(),
            amount: Math.round(amount),
            month,
        },
    });

    return NextResponse.json(income, { status: 201 });
}