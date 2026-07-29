import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function monthRange(month: string) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    return { start, end };
}

export async function GET(req: NextRequest) {
    const month = req.nextUrl.searchParams.get("month");
    if (!month) {
        return NextResponse.json({ error: "month is required" }, { status: 400 });
    }
    const { start, end } = monthRange(month);

    const savings = await prisma.saving.findMany({
        where: { date: { gte: start, lt: end } },
        include: { category: true },
        orderBy: { date: "desc" },
    });

    const total = savings.reduce((sum, s) => sum + Number(s.amount), 0);

    return NextResponse.json({
        total,
        entries: savings.map((s) => ({
            id: s.id,
            categoryId: s.categoryId,
            categoryName: s.category.name,
            amount: Number(s.amount),
            date: s.date,
        })),
    });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { categoryId, amount, month } = body;

    if (!categoryId || !amount || amount <= 0) {
        return NextResponse.json({ error: "categoryId and a valid amount are required" }, { status: 400 });
    }
    if (!month) {
        return NextResponse.json({ error: "month is required" }, { status: 400 });
    }

    const { start } = monthRange(month);

    const saving = await prisma.saving.create({
        data: { categoryId, amount, date: start },
    });

    return NextResponse.json(saving, { status: 201 });
}