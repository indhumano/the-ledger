"use client";

import { useEffect, useState } from "react";

type Income = {
    id: number;
    source: string;
    amount: number;
    date: string;
    month: string;
};

function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function IncomePage() {
    const [month, setMonth] = useState(currentMonth());
    const [incomeList, setIncomeList] = useState<Income[]>([]);
    const [source, setSource] = useState("");
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchIncome = async (selectedMonth: string) => {
        const res = await fetch(`/api/income?month=${selectedMonth}`);
        const data = await res.json();
        setIncomeList(data);
    };

    useEffect(() => {
        fetchIncome(month);
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [month]);

    const resetForm = () => {
        setSource("");
        setAmount("");
        setEditingId(null);
        setError("");
    };

    const handleSubmit = async () => {
        setError("");
        const amt = parseFloat(amount);

        if (!source.trim()) {
            setError("Source is required");
            return;
        }
        if (!amt || amt <= 0) {
            setError("Amount must be greater than zero");
            return;
        }

        setLoading(true);
        const url = editingId ? `/api/income/${editingId}` : "/api/income";
        const method = editingId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source: source.trim(), amount: amt, month }),
        });
        setLoading(false);

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Something went wrong");
            return;
        }

        resetForm();
        fetchIncome(month);
    };

    const handleEdit = (item: Income) => {
        setEditingId(item.id);
        setSource(item.source);
        setAmount(String(item.amount));
    };

    const handleDelete = async (item: Income) => {
        const confirmed = window.confirm(
            `Delete "${item.source}" (₹${item.amount.toLocaleString()})? This cannot be undone.`
        );
        if (!confirmed) return;

        setDeletingId(item.id);
        setError("");

        const res = await fetch(`/api/income/${item.id}`, { method: "DELETE" });
        setDeletingId(null);

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to delete income");
            return;
        }

        if (editingId === item.id) {
            resetForm();
        }
        fetchIncome(month);
    };

    const total = incomeList.reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="max-w-md mx-auto mt-10 p-4">
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold">Income</h1>
                <input
                    type="month"
                    className="input input-bordered input-sm"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </div>
            <p className="text-sm text-base-content/60 mb-4">Showing income for {month}</p>

            <div className="flex flex-col gap-2 mb-2">
                <input
                    type="text"
                    placeholder="Source (e.g. Salary)"
                    className="input input-bordered w-full"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                />
                <div className="join w-full">
                    <input
                        type="number"
                        placeholder="Amount"
                        className="input input-bordered join-item w-full"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                    <button
                        className="btn btn-primary join-item"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : editingId ? "Update" : "Add"}
                    </button>
                </div>
                {editingId && (
                    <button className="btn btn-ghost btn-sm self-start" onClick={resetForm}>
                        Cancel edit
                    </button>
                )}
            </div>

            {error && <p className="text-error text-sm mb-4">{error}</p>}

            <div className="stats shadow w-full mt-6 mb-4">
                <div className="stat">
                    <div className="stat-title">Total Income</div>
                    <div className="stat-value text-primary">₹{total.toLocaleString()}</div>
                </div>
            </div>

            <ul className="space-y-2">
                {incomeList.map((item) => (
                    <li
                        key={item.id}
                        className="card bg-base-200 p-3 shadow-sm flex-row justify-between items-center"
                    >
                        <div>
                            <p className="font-medium">{item.source}</p>
                            <p className="text-sm text-base-content/60">
                                ₹{item.amount.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-sm btn-outline" onClick={() => handleEdit(item)}>
                                Edit
                            </button>
                            <button
                                className="btn btn-sm btn-error btn-outline"
                                onClick={() => handleDelete(item)}
                                disabled={deletingId === item.id}
                            >
                                {deletingId === item.id ? "..." : "Delete"}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {incomeList.length === 0 && (
                <p className="text-sm text-base-content/60 mt-4">No income recorded for this month.</p>
            )}
        </div>
    );
}