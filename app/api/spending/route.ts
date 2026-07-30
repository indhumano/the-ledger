import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";

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
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            budgetPlans: { where: { date: { gte: start, lt: end } } },
            spendings: { where: { date: { gte: start, lt: end } } },
        },
    });
    const result = categories.map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        amountPlanned: cat.budgetPlans[0]?.amountPlanned ?? 0,
        spendingId: cat.spendings[0]?.id ?? null,
        amountSpent: cat.spendings[0]?.amountSpent ?? 0,
        comment: cat.spendings[0]?.comment ?? "",
    }));
    return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId, amountSpent, comment, month } = body;
    if (!categoryId || amountSpent == null || amountSpent <= 0) {
        return NextResponse.json({ error: "amountSpent must be greater than zero" }, { status: 400 });
    }
    if (!month) {
        return NextResponse.json({ error: "month is required" }, { status: 400 });
    }
    const { start, end } = monthRange(month);
    const existing = await prisma.spending.findFirst({
        where: { categoryId, date: { gte: start, lt: end } },
    });
    const spending = existing
        ? await prisma.spending.update({
            where: { id: existing.id },
            data: { amountSpent, comment: comment ?? null },
        })
        : await prisma.spending.create({
            data: {
                category: { connect: { id: categoryId } },
                user: { connect: { id: userId } },
                amountSpent,
                comment: comment ?? null,
                date: start,
            },
        });
    return NextResponse.json(spending);
}
