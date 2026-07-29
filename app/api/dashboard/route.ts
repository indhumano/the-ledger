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

    const income = await prisma.familyIncome.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lt: end } },
    });

    const savings = await prisma.saving.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lt: end } },
    });

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            budgetPlans: { where: { date: { gte: start, lt: end } } },
            spendings: { where: { date: { gte: start, lt: end } } },
        },
    });

    const categorySummary = categories.map((cat) => {
        const budgetAllocated = Number(cat.budgetPlans[0]?.amountPlanned ?? 0);
        const amountSpent = Number(cat.spendings[0]?.amountSpent ?? 0);
        return {
            categoryId: cat.id,
            categoryName: cat.name,
            budgetAllocated,
            amountSpent,
            remainingBudget: budgetAllocated - amountSpent,
        };
    });

    const totalIncome = income._sum.amount ?? 0;
    const totalSpending = categorySummary.reduce((sum, c) => sum + c.amountSpent, 0);
    const totalSavings = Number(savings._sum.amount ?? 0);
    const remainingBalance = totalIncome - totalSpending;

    return NextResponse.json({
        totalIncome,
        totalSpending,
        totalSavings,
        remainingBalance,
        categorySummary,
    });
}