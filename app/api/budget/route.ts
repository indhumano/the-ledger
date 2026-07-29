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

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            budgetPlans: {
                where: { date: { gte: start, lt: end } },
            },
        },
    });

    const income = await prisma.familyIncome.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lt: end } },
    });

    const result = categories.map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        budgetPlanId: cat.budgetPlans[0]?.id ?? null,
        amountPlanned: cat.budgetPlans[0]?.amountPlanned ?? 0,
    }));

    return NextResponse.json({
        totalIncome: income._sum.amount ?? 0,
        categories: result,
    });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { categoryId, amountPlanned, month } = body;

    if (!categoryId || amountPlanned == null || amountPlanned < 0) {
        return NextResponse.json({ error: "categoryId and a valid amount are required" }, { status: 400 });
    }
    if (!month) {
        return NextResponse.json({ error: "month is required" }, { status: 400 });
    }

    const { start, end } = monthRange(month);

    const existing = await prisma.budgetPlan.findFirst({
        where: { categoryId, date: { gte: start, lt: end } },
    });

    const plan = existing
        ? await prisma.budgetPlan.update({
            where: { id: existing.id },
            data: { amountPlanned },
        })
        : await prisma.budgetPlan.create({
            data: { categoryId, amountPlanned, date: start },
        });

    return NextResponse.json(plan);
}