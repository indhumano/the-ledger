"use client";
import LogoutButton from "@/components/LogoutButton";

import Link from "next/link";
import { useState } from "react";
import { Special_Elite } from 'next/font/google';

const specialElite = Special_Elite({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-typewriter-gritty',
});

const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/category", label: "Category" },
    { href: "/income", label: "Income" },
    { href: "/budget", label: "Budget" },
    { href: "/spending", label: "Spending" },
    { href: "/savings", label: "Savings" },

];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="navbar bg-base-300 shadow-sm px-4 sm:px-6 relative">
            <div className="flex-1 flex items-center gap-2">
                {/* Hamburger button, mobile only */}
                <button
                    className="btn btn-ghost lg:hidden"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label="Toggle menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h8m-8 6h16"
                        />
                    </svg>
                </button>

                <Link href="/" className="text-2xl sm:text-2xl font-bold whitespace-nowrap" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-3">

                        <img src='/icon-512.png'
                            width={50}
                            height={50} />

                        <div className={specialElite.className}>
                            The Ledger
                        </div>
                    </div>
                </Link>
            </div>

            {/* Desktop nav links */}
            <div className="flex-none hidden lg:block">
                <ul className="menu menu-horizontal gap-1 items-center">
                    {navLinks.map((link) => (
                        <li key={link.href} className="text-md font-bold">
                            <Link href={link.href}>{link.label}</Link>
                        </li>
                    ))}
                    <li>
                        <LogoutButton />
                    </li>
                </ul>
            </div>

            {/* Mobile menu overlay */}
            {menuOpen && (
                <ul className="menu bg-base-100 rounded-box shadow lg:hidden absolute top-full left-4 mt-2 w-52 z-50">
                    {navLinks.map((link) => (
                        <li key={link.href} className="font-bold">
                            <Link href={link.href} onClick={() => setMenuOpen(false)}>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li className="mt-1">
                        <LogoutButton />
                    </li>
                </ul>
            )}


        </div>
    );
}