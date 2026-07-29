import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const categoryId = Number(id);

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await prisma.$transaction([
        prisma.spending.deleteMany({ where: { categoryId } }),
        prisma.budgetPlan.deleteMany({ where: { categoryId } }),
        prisma.category.delete({ where: { id: categoryId } }),
    ]);

    return NextResponse.json({ success: true });
}