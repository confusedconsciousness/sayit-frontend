"use client";

import {useAuth, useUser} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function SyncUserPage() {
    const {user, isLoaded} = useUser();
    const router = useRouter();
    const {getToken} = useAuth();

    useEffect(() => {
        // We must wait for the Clerk user object to be fully loaded

        if (isLoaded && user) {
            const syncUser = async () => {
                console.log("Syncing user to backend:", user.id);
                const token = await getToken({template: 'with-username'}) as string;
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/v1/auth`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
                        body: JSON.stringify({
                            name: user.firstName,
                            email: user.primaryEmailAddress?.emailAddress,
                            username: user.username
                        }),
                    });

                    // After the sync is complete, send them to the real destination
                    router.push("/");

                } catch (err) {
                    console.error("Failed to sync user:", err);
                    router.push("/"); // Redirect home on error
                }
            };

            syncUser().then(r => console.log(r));
        }
    }, [isLoaded, user, router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-xl">Syncing your account, please wait...</p>
        </div>
    );
}