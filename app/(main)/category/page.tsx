"use client";

import { useEffect, useState } from "react";

type Category = {
    id: number;
    name: string;
};

export default function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchCategories = async () => {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
    };

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, []);

    const handleAdd = async () => {
        setError("");
        if (!name.trim()) return;

        setLoading(true);
        const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim() }),
        });
        setLoading(false);

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Something went wrong");
            return;
        }

        setName("");
        fetchCategories();
    };

    const handleDelete = async (cat: Category) => {
        const confirmed = window.confirm(
            `Delete "${cat.name}"? This will also remove its budget and spending history for every month.`
        );
        if (!confirmed) return;

        setDeletingId(cat.id);
        const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
        setDeletingId(null);

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to delete category");
            return;
        }

        fetchCategories();
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-4">Categories</h1>

            <div className="join w-full mb-2">
                <input
                    type="text"
                    placeholder="e.g. Grocery, Fuel, Medical"
                    className="input input-bordered join-item w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <button
                    className="btn btn-primary join-item"
                    onClick={handleAdd}
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add"}
                </button>
            </div>

            {error && <p className="text-error text-sm mb-4">{error}</p>}

            <ul className="mt-6 space-y-2">
                {categories.map((cat) => (
                    <li
                        key={cat.id}
                        className="card bg-base-200 p-3 shadow-sm flex-row justify-between items-center"
                    >
                        <span>{cat.name}</span>
                        <button
                            className="btn btn-sm btn-ghost text-error"
                            onClick={() => handleDelete(cat)}
                            disabled={deletingId === cat.id}
                        >
                            {deletingId === cat.id ? "..." : "Delete"}
                        </button>
                    </li>
                ))}
            </ul>

            {categories.length === 0 && (
                <p className="text-sm text-base-content/60 mt-4">No categories yet.</p>
            )}
        </div>
    );
}