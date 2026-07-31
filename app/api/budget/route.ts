import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const month = req.nextUrl.searchParams.get("month");
    if (!month) {
        return NextResponse.json({ error: "month is required" }, { status: 400 });
    }

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            budgetPlans: { where: { month } },
        },
    });

    const income = await prisma.familyIncome.aggregate({
        _sum: { amount: true },
        where: { month },
    });

    const savings = await prisma.saving.aggregate({
        _sum: { amount: true },
        where: { month },
    });

    const result = categories.map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        budgetPlanId: cat.budgetPlans[0]?.id ?? null,
        amountPlanned: cat.budgetPlans[0]?.amountPlanned ?? 0,
    }));

    return NextResponse.json({
        totalIncome: income._sum.amount ?? 0,
        totalSavings: Number(savings._sum.amount ?? 0),
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

    const existing = await prisma.budgetPlan.findFirst({
        where: { categoryId, month },
    });

    const plan = existing
        ? await prisma.budgetPlan.update({
            where: { id: existing.id },
            data: { amountPlanned },
        })
        : await prisma.budgetPlan.create({
            data: { categoryId, amountPlanned, month },
        });

    return NextResponse.json(plan);
}