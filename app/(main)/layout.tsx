import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import { Courier_Prime } from 'next/font/google';
import type { ReactNode } from "react";

// Configure the clean typewriter font
const courierPrime = Courier_Prime({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-typewriter-clean',
});

export const metadata = {
    title: "The Ledger",
    description: "Family budget management",
};

export default function MainLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
        </>
    );
}