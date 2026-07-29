import "./globals.css";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export const metadata = {
    title: "The Ledger",
    description: "Family Budget Management",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}