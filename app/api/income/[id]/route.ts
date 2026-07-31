import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const incomeId = Number(id);

    if (!Number.isInteger(incomeId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { source, amount, month } = body;

    if (!source?.trim()) {
        return NextResponse.json({ error: "Source is required" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    }

    try {
        const income = await prisma.familyIncome.update({
            where: { id: incomeId },
            data: {
                source: source.trim(),
                amount: Math.round(amount),
                ...(month ? { month } : {}),
            },
        });
        return NextResponse.json(income);
    } catch {
        return NextResponse.json({ error: "Income entry not found" }, { status: 404 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const incomeId = Number(id);

    if (!Number.isInteger(incomeId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        await prisma.familyIncome.delete({
            where: { id: incomeId },
        });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Income entry not found" }, { status: 404 });
    }
}