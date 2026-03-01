"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const roles = [
    {
        id: "entrepreneur",
        title: "Entrepreneur",
        description: "Submit your business pitch and connect with investors",
        icon: "🚀",
    },
    {
        id: "investor",
        title: "Investor",
        description: "Discover AI-matched business opportunities",
        icon: "💼",
    },
] as const;

export default function OnboardingPage() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleRoleSelect = async () => {
        if (!selectedRole || !user) return;

        setLoading(true);
        setError("");

        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/auth/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: selectedRole }),
            });

            if (!res.ok) {
                throw new Error("Failed to update role");
            }

            // Redirect based on role
            const redirects: Record<string, string> = {
                entrepreneur: "/entrepreneur/dashboard",
                investor: "/investor/feed",
            };

            router.push(redirects[selectedRole] || "/");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // While verifying auth state, show a spinner (prevents UI flashing)
    if (authLoading || (user && !userProfile)) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // If user has completed onboarding (status is pending or verified), redirect them to their dashboard
    if (userProfile?.role && userProfile.status !== "unverified") {
        const redirects: Record<string, string> = {
            admin: "/admin/oversight",
            entrepreneur: "/entrepreneur/dashboard",
            investor: "/investor/feed",
        };
        router.push(redirects[userProfile.role] || "/");
        return null; // Prevents render while push happens
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 p-4">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-2xl">
                        S
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to SEPMS</h1>
                    <p className="text-muted-foreground text-lg">
                        Tell us about yourself so we can personalize your experience
                    </p>
                </div>

                {error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive text-center">
                        {error}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    {roles.map((role) => (
                        <Card
                            key={role.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 ${selectedRole === role.id
                                ? "border-primary shadow-lg ring-2 ring-primary/20"
                                : "border-border/40"
                                }`}
                            onClick={() => setSelectedRole(role.id)}
                        >
                            <CardHeader className="text-center pb-2">
                                <div className="text-4xl mb-2">{role.icon}</div>
                                <CardTitle className="text-xl">{role.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center text-sm">
                                    {role.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center">
                    <Button
                        size="lg"
                        className="w-full max-w-xs"
                        disabled={!selectedRole || loading}
                        onClick={handleRoleSelect}
                    >
                        {loading ? "Setting up..." : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
