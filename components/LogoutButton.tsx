// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    }

    return (
        <button onClick={handleLogout} className="text-sm btn btn-primary btn-sm">
            Logout
        </button>
    );
}