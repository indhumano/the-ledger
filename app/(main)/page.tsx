"use client";

import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

type CategorySummary = {
    categoryId: number;
    categoryName: string;
    budgetAllocated: number;
    amountSpent: number;
    remainingBudget: number;
};

function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const PIE_COLORS = [
    "#7c3aed", "#2563eb", "#059669", "#d97706",
    "#dc2626", "#0891b2", "#c026d3", "#65a30d",
];

export default function DashboardPage() {
    const [month, setMonth] = useState(currentMonth());
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalSpending, setTotalSpending] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);
    const [remainingBalance, setRemainingBalance] = useState(0);
    const [categories, setCategories] = useState<CategorySummary[]>([]);

    const fetchDashboard = async (selectedMonth: string) => {
        const res = await fetch(`/api/dashboard?month=${selectedMonth}`);
        const data = await res.json();
        setTotalIncome(data.totalIncome);
        setTotalSpending(data.totalSpending);
        setTotalSavings(data.totalSavings ?? 0);
        setRemainingBalance(data.remainingBalance);
        setCategories(data.categorySummary);
    };

    useEffect(() => {
        fetchDashboard(month);
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [month]);

    const pieData = categories
        .filter((c) => c.amountSpent > 0)
        .map((c) => ({ name: c.categoryName, value: c.amountSpent }));

    const barData = [
        { name: "This Month", Income: totalIncome, Spending: totalSpending, Savings: totalSavings },
    ];

    return (
        <div className="max-w-3xl mx-auto mt-10 p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <input
                    type="month"
                    className="input input-bordered input-sm"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </div>

            <h2 className="text-lg font-semibold mb-2">Income Summary</h2>
            <div className="stats shadow w-full mb-8">
                <div className="stat">
                    <div className="stat-title">Total Income</div>
                    <div className="stat-value text-primary text-2xl">
                        ₹{totalIncome.toLocaleString()}
                    </div>
                </div>
                <div className="stat">
                    <div className="stat-title">Total Spending</div>
                    <div className="stat-value text-2xl">₹{totalSpending.toLocaleString()}</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Total Savings</div>
                    <div className="stat-value text-success text-2xl">
                        ₹{totalSavings.toLocaleString()}
                    </div>
                </div>
                <div className="stat">
                    <div className="stat-title">Balance</div>
                    <div
                        className={`stat-value text-2xl ${remainingBalance < 0 ? "text-error" : "text-success"
                            }`}
                    >
                        ₹{remainingBalance.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="card bg-base-200 p-4 shadow-sm">
                    <h2 className="font-semibold mb-2">Spending by Category</h2>
                    {pieData.length === 0 ? (
                        <p className="text-sm text-base-content/60">No spending recorded yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={(entry) => entry.name}
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                    <Tooltip
                                        formatter={(value) => {
                                            const num = typeof value === "number" ? value : Number(value ?? 0);
                                            return `₹${num.toLocaleString()}`;
                                        }}
                                    />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="card bg-base-200 p-4 shadow-sm">
                    <h2 className="font-semibold mb-2">Income vs Spending vs Savings</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => {
                                    const num = typeof value === "number" ? value : Number(value ?? 0);
                                    return `₹${num.toLocaleString()}`;
                                }}
                            />
                            <Legend />
                            <Bar dataKey="Income" fill="#7c3aed" />
                            <Bar dataKey="Spending" fill="#dc2626" />
                            <Bar dataKey="Savings" fill="#059669" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-2">Category Summary</h2>

            {categories.length === 0 && (
                <p className="text-sm text-base-content/60">
                    No categories yet. Add some on the Category page first.
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {categories.map((cat) => {
                    const overBudget =
                        cat.amountSpent > cat.budgetAllocated && cat.budgetAllocated > 0;
                    return (
                        <div
                            key={cat.categoryId}
                            className={`card shadow-sm p-4 ${overBudget ? "bg-error text-error-content" : "bg-base-200"
                                }`}
                        >
                            <h3 className="font-semibold mb-2 text-red-700">{cat.categoryName}</h3>
                            <div className="flex justify-between text-sm">
                                <span>Budget</span>
                                <span>₹{cat.budgetAllocated.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Spent</span>
                                <span>₹{cat.amountSpent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                                <span>Remaining</span>
                                <span>₹{cat.remainingBudget.toLocaleString()}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}