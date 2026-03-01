"use client";

import { useAuth, UserRole } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requireVerified?: boolean;
}

export default function ProtectedRoute({
    children,
    allowedRoles,
    requireVerified = false,
}: ProtectedRouteProps) {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        // Not logged in → redirect to sign in
        if (!user) {
            router.push("/sign-in");
            return;
        }

        // Logged in via Firebase but no backend profile → redirect to onboarding
        if (!userProfile) {
            router.push("/onboarding");
            return;
        }

        // Needs verification but isn't verified
        if (requireVerified && userProfile.status !== "verified") {
            router.push("/onboarding");
            return;
        }

        // Role check
        if (allowedRoles && userProfile.role && !allowedRoles.includes(userProfile.role)) {
            // Redirect to the user's correct dashboard
            const roleRedirects: Record<string, string> = {
                admin: "/admin/oversight",
                entrepreneur: "/entrepreneur/dashboard",
                investor: "/investor/feed",
            };
            router.push(roleRedirects[userProfile.role] || "/");
            return;
        }
    }, [user, userProfile, loading, router, allowedRoles, requireVerified]);

    // Show loading spinner
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children until auth checks pass
    if (!user || !userProfile) return null;

    if (allowedRoles && userProfile.role && !allowedRoles.includes(userProfile.role)) {
        return null;
    }

    return <>{children}</>;
}
