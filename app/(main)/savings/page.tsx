"use client";

import { useEffect, useState } from "react";

type SavingsCategory = { id: number; name: string };
type SavingEntry = {
    id: number;
    categoryId: number;
    categoryName: string;
    amount: number;
    date: string;
};

function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function SavingsPage() {
    const [month, setMonth] = useState(currentMonth());
    const [categories, setCategories] = useState<SavingsCategory[]>([]);
    const [entries, setEntries] = useState<SavingEntry[]>([]);
    const [total, setTotal] = useState(0);

    const [newCategory, setNewCategory] = useState("");
    const [categoryError, setCategoryError] = useState("");

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
    const [amount, setAmount] = useState("");
    const [entryError, setEntryError] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchCategories = async () => {
        const res = await fetch("/api/savings-categories");
        const data = await res.json();
        setCategories(data);
    };

    const fetchSavings = async (selectedMonth: string) => {
        const res = await fetch(`/api/savings?month=${selectedMonth}`);
        const data = await res.json();
        setEntries(data.entries);
        setTotal(data.total);
    };

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, []);

    useEffect(() => {
        fetchSavings(month);
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [month]);

    const handleAddCategory = async () => {
        setCategoryError("");
        if (!newCategory.trim()) return;

        const res = await fetch("/api/savings-categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newCategory.trim() }),
        });

        if (!res.ok) {
            const data = await res.json();
            setCategoryError(data.error || "Something went wrong");
            return;
        }

        setNewCategory("");
        fetchCategories();
    };

    const handleAddEntry = async () => {
        setEntryError("");
        const amt = parseFloat(amount);

        if (!selectedCategoryId) {
            setEntryError("Select a savings category");
            return;
        }
        if (!amt || amt <= 0) {
            setEntryError("Amount must be greater than zero");
            return;
        }

        setSaving(true);
        const res = await fetch("/api/savings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoryId: selectedCategoryId, amount: amt, month }),
        });
        setSaving(false);

        if (!res.ok) {
            const data = await res.json();
            setEntryError(data.error || "Something went wrong");
            return;
        }

        setAmount("");
        fetchSavings(month);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-4">
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold">Savings</h1>
                <input
                    type="month"
                    className="input input-bordered input-sm"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </div>
            <p className="text-sm text-base-content/60 mb-4">Tracking savings for {month}</p>

            <div className="stats shadow w-full mb-6">
                <div className="stat">
                    <div className="stat-title">Total Savings</div>
                    <div className="stat-value text-success text-2xl">₹{total.toLocaleString()}</div>
                </div>
            </div>

            <h2 className="font-semibold mb-2">Savings Categories</h2>
            <div className="join w-full mb-2">
                <input
                    type="text"
                    placeholder="e.g. Emergency Fund, Vacation"
                    className="input input-bordered join-item w-full"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <button className="btn btn-primary join-item" onClick={handleAddCategory}>
                    Add
                </button>
            </div>
            {categoryError && <p className="text-error text-sm mb-4">{categoryError}</p>}

            <h2 className="font-semibold mb-2 mt-6">Log Savings</h2>
            <div className="flex flex-col gap-2 mb-2">
                <select
                    className="select select-bordered w-full"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <div className="join w-full">
                    <input
                        type="number"
                        placeholder="Amount"
                        className="input input-bordered join-item w-full"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
                    />
                    <button
                        className="btn btn-primary join-item"
                        onClick={handleAddEntry}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Add"}
                    </button>
                </div>
            </div>
            {entryError && <p className="text-error text-sm mb-4">{entryError}</p>}

            <ul className="space-y-2 mt-6">
                {entries.map((entry) => (
                    <li key={entry.id} className="card bg-base-200 p-3 shadow-sm flex-row justify-between">
                        <span>{entry.categoryName}</span>
                        <span className="font-medium">₹{entry.amount.toLocaleString()}</span>
                    </li>
                ))}
            </ul>

            {entries.length === 0 && (
                <p className="text-sm text-base-content/60 mt-4">No savings logged for this month.</p>
            )}
        </div>
    );
}