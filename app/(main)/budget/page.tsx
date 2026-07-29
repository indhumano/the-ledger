"use client";

import { useEffect, useState } from "react";

type CategoryBudget = {
    categoryId: number;
    categoryName: string;
    budgetPlanId: number | null;
    amountPlanned: number;
};

function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function BudgetPage() {
    const [month, setMonth] = useState(currentMonth());
    const [totalIncome, setTotalIncome] = useState(0);
    const [categories, setCategories] = useState<CategoryBudget[]>([]);
    const [savingId, setSavingId] = useState<number | null>(null);

    const fetchData = async (selectedMonth: string) => {
        const res = await fetch(`/api/budget?month=${selectedMonth}`);
        const data = await res.json();
        setTotalIncome(data.totalIncome);
        setCategories(data.categories);
    };

    useEffect(() => {
        fetchData(month);
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [month]);

    const handleChange = (categoryId: number, value: string) => {
        setCategories((prev) =>
            prev.map((c) =>
                c.categoryId === categoryId ? { ...c, amountPlanned: Number(value) || 0 } : c
            )
        );
    };

    const handleSave = async (cat: CategoryBudget) => {
        setSavingId(cat.categoryId);
        await fetch("/api/budget", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                categoryId: cat.categoryId,
                amountPlanned: cat.amountPlanned,
                month,
            }),
        });
        setSavingId(null);
        fetchData(month);
    };

    const totalAllocated = categories.reduce((sum, c) => sum + Number(c.amountPlanned), 0);
    const remaining = totalIncome - totalAllocated;
    const isOverAllocated = totalAllocated > totalIncome;

    return (
        <div className="max-w-md mx-auto mt-10 p-4">
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold">Budget Planning</h1>
                <input
                    type="month"
                    className="input input-bordered input-sm"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </div>
            <p className="text-sm text-base-content/60 mb-4">Allocating budget for {month}</p>

            {isOverAllocated && (
                <div role="alert" className="alert alert-warning mb-4">
                    <span>Allocated budget exceeds total income for this month.</span>
                </div>
            )}

            <div className="stats shadow w-full mb-4">
                <div className="stat">
                    <div className="stat-title">Total Income</div>
                    <div className="stat-value text-primary text-lg">₹{totalIncome.toLocaleString()}</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Allocated</div>
                    <div className="stat-value text-lg">₹{totalAllocated.toLocaleString()}</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Remaining</div>
                    <div className={`stat-value text-lg ${remaining < 0 ? "text-error" : "text-success"}`}>
                        ₹{remaining.toLocaleString()}
                    </div>
                </div>
            </div>

            {categories.length === 0 && (
                <p className="text-sm text-base-content/60">
                    No categories yet. Add some on the Category page first.
                </p>
            )}

            <ul className="space-y-2">
                {categories.map((cat) => (
                    <li key={cat.categoryId} className="card bg-base-200 p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{cat.categoryName}</span>
                            <div className="join">
                                <input
                                    type="number"
                                    className="input input-bordered input-sm join-item w-28"
                                    value={cat.amountPlanned}
                                    onChange={(e) => handleChange(cat.categoryId, e.target.value)}
                                />
                                <button
                                    className="btn btn-sm btn-primary join-item"
                                    onClick={() => handleSave(cat)}
                                    disabled={savingId === cat.categoryId}
                                >
                                    {savingId === cat.categoryId ? "..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}