"use client";

import { useEffect, useState } from "react";

type CategorySpending = {
    categoryId: number;
    categoryName: string;
    amountPlanned: number;
    spendingId: number | null;
    amountSpent: number;
    comment: string;
};

function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function SpendingPage() {
    const [month, setMonth] = useState(currentMonth());
    const [categories, setCategories] = useState<CategorySpending[]>([]);
    const [savingId, setSavingId] = useState<number | null>(null);

    const fetchData = async (selectedMonth: string) => {
        const res = await fetch(`/api/spending?month=${selectedMonth}`);
        const data = await res.json();
        setCategories(data);
    };

    useEffect(() => {
        fetchData(month);
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [month]);

    const handleAmountChange = (categoryId: number, value: string) => {
        setCategories((prev) =>
            prev.map((c) =>
                c.categoryId === categoryId ? { ...c, amountSpent: Number(value) || 0 } : c
            )
        );
    };

    const handleCommentChange = (categoryId: number, value: string) => {
        setCategories((prev) =>
            prev.map((c) => (c.categoryId === categoryId ? { ...c, comment: value } : c))
        );
    };

    const handleSave = async (cat: CategorySpending) => {
        if (cat.amountSpent <= 0) return;
        setSavingId(cat.categoryId);
        await fetch("/api/spending", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                categoryId: cat.categoryId,
                amountSpent: cat.amountSpent,
                comment: cat.comment,
                month,
            }),
        });
        setSavingId(null);
        fetchData(month);
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-4">
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold">Spending</h1>
                <input
                    type="month"
                    className="input input-bordered input-sm"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </div>
            <p className="text-sm text-base-content/60 mb-4">Tracking spending for {month}</p>

            {categories.length === 0 && (
                <p className="text-sm text-base-content/60">
                    No categories yet. Add some on the Category page first.
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => {
                    const remaining = cat.amountPlanned - cat.amountSpent;
                    const overBudget = cat.amountSpent > cat.amountPlanned && cat.amountPlanned > 0;

                    return (
                        <div
                            key={cat.categoryId}
                            className={`card shadow-sm p-4 ${overBudget ? "bg-error text-error-content" : "bg-base-200"
                                }`}
                        >
                            <h2 className="font-semibold text-lg mb-2">{cat.categoryName}</h2>

                            <div className="flex justify-between text-sm mb-1">
                                <span>Planned Budget</span>
                                <span>₹{cat.amountPlanned.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between text-sm mb-3">
                                <span>Remaining</span>
                                <span>₹{remaining.toLocaleString()}</span>
                            </div>

                            <input
                                type="number"
                                placeholder="Amount spent"
                                className="input input-bordered input-sm w-full mb-2"
                                value={cat.amountSpent || ""}
                                onChange={(e) => handleAmountChange(cat.categoryId, e.target.value)}
                            />

                            <textarea
                                placeholder="Add a comment (optional)"
                                className="textarea textarea-bordered textarea-sm w-full mb-2"
                                rows={2}
                                value={cat.comment}
                                onChange={(e) => handleCommentChange(cat.categoryId, e.target.value)}
                            />

                            <button
                                className="btn btn-sm btn-primary w-full"
                                onClick={() => handleSave(cat)}
                                disabled={savingId === cat.categoryId}
                            >
                                {savingId === cat.categoryId ? "Saving..." : "Save"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}