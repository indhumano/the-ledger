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

type PendingInput = {
    amount: string;
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
    const [savedId, setSavedId] = useState<number | null>(null);
    // Local, per-category draft of what the user is typing. Kept separate
    // from `categories` (which holds only confirmed/saved data) so that
    // Remaining / over-budget coloring never reacts to unsaved keystrokes.
    const [inputs, setInputs] = useState<Record<number, PendingInput>>({});

    const fetchData = async (selectedMonth: string) => {
        const res = await fetch(`/api/spending?month=${selectedMonth}`);
        const data: CategorySpending[] = await res.json();
        setCategories(data);
        // Always start each category's input blank. This is what makes the
        // box "clear" after a save - we never prefill it from saved totals.
        setInputs({});
    };

    useEffect(() => {
        fetchData(month);
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [month]);

    const getInput = (categoryId: number): PendingInput =>
        inputs[categoryId] ?? { amount: "", comment: "" };

    const handleAmountChange = (categoryId: number, value: string) => {
        setInputs((prev) => ({
            ...prev,
            [categoryId]: { ...getInput(categoryId), amount: value },
        }));
    };

    const handleCommentChange = (categoryId: number, value: string) => {
        setInputs((prev) => ({
            ...prev,
            [categoryId]: { ...getInput(categoryId), comment: value },
        }));
    };

    const handleSave = async (cat: CategorySpending) => {
        const input = getInput(cat.categoryId);
        const amountSpent = Number(input.amount);
        if (!amountSpent || amountSpent <= 0) return;

        setSavingId(cat.categoryId);
        try {
            const res = await fetch("/api/spending", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryId: cat.categoryId,
                    amountSpent,
                    comment: input.comment,
                    month,
                }),
            });
            if (!res.ok) throw new Error("Save failed");

            // Clear just this category's draft immediately, so the box is
            // visibly empty even before the refetch below completes.
            setInputs((prev) => ({
                ...prev,
                [cat.categoryId]: { amount: "", comment: "" },
            }));
            setSavedId(cat.categoryId);
            setTimeout(() => setSavedId((id) => (id === cat.categoryId ? null : id)), 2000);

            await fetchData(month);
        } catch (err) {
            alert("Could not save — please try again.");
        } finally {
            setSavingId(null);
        }
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
                    // These are derived ONLY from saved data (cat.amountSpent),
                    // never from the live input - so the red highlight is stable
                    // and always matches what's actually stored.
                    const remaining = cat.amountPlanned - cat.amountSpent;
                    const overBudget = cat.amountSpent > cat.amountPlanned && cat.amountPlanned > 0;
                    const input = getInput(cat.categoryId);
                    const isSaving = savingId === cat.categoryId;
                    const justSaved = savedId === cat.categoryId;

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
                                value={input.amount}
                                onChange={(e) => handleAmountChange(cat.categoryId, e.target.value)}
                            />

                            <textarea
                                placeholder="Add a comment (optional)"
                                className="textarea textarea-bordered textarea-sm w-full mb-2"
                                rows={2}
                                value={input.comment}
                                onChange={(e) => handleCommentChange(cat.categoryId, e.target.value)}
                            />

                            <button
                                className="btn btn-sm btn-primary w-full"
                                onClick={() => handleSave(cat)}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : justSaved ? "Saved ✓" : "Save"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}