import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const month = req.nextUrl.searchParams.get("month");
    if (!month) {
        return NextResponse.json({ error: "month is required" }, { status: 400 });
    }

    const income = await prisma.familyIncome.aggregate({
        _sum: { amount: true },
        where: { month },
    });

    const savings = await prisma.saving.aggregate({
        _sum: { amount: true },
        where: { month },
    });

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            budgetPlans: { where: { month } },
            spendings: { where: { month } },
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
    // Balance = income left after both spending and savings are accounted for
    const remainingBalance = totalIncome - totalSpending - totalSavings;

    return NextResponse.json({
        totalIncome,
        totalSpending,
        totalSavings,
        remainingBalance,
        categorySummary,
    });
}