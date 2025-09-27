// components/Header.tsx
"use client";

import {usePathname} from "next/navigation";
import Link from "next/link";

export default function Header() {
    const pathname = usePathname();

    const hideHeading = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

    return (
        <div className="flex justify-between items-center mb-4">
            {!hideHeading && (
                <Link href={'/'} className="text-4xl font-bold">Sayit - It&apos;s your Space</Link>
            )}
        </div>
    );
}
