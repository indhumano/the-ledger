import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const categories = await prisma.savingsCategory.findMany({
        orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const name = body.name?.trim();

    if (!name) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const existing = await prisma.savingsCategory.findUnique({ where: { name } });
    if (existing) {
        return NextResponse.json({ error: "Savings category already exists" }, { status: 409 });
    }

    const category = await prisma.savingsCategory.create({ data: { name } });
    return NextResponse.json(category, { status: 201 });
}