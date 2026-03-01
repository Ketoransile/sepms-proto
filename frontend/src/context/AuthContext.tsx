"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

// ---------------------
// Types
// ---------------------
export type UserRole = "admin" | "entrepreneur" | "investor" | null;

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: UserRole;
    status: "unverified" | "pending" | "verified";
    photoURL: string | null;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string, additionalData?: { role: string; companyName?: string; fundName?: string }) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: (additionalData?: { role: string; companyName?: string; fundName?: string }) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------
// Provider
// ---------------------
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    // Fetch user profile from our backend
    const fetchUserProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                return data.user;
            }

            // If 404, user exists in Firebase but not in our DB yet
            return null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    };

    // Sync or create user in our backend after Firebase auth
    const syncUserWithBackend = async (
        firebaseUser: User,
        isNewUser: boolean = false,
        additionalData?: { role?: string; companyName?: string; fundName?: string }
    ): Promise<UserProfile | null> => {
        try {
            const token = await firebaseUser.getIdToken();

            if (isNewUser) {
                // Register user in our backend
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        fullName: firebaseUser.displayName || "New User",
                        email: firebaseUser.email,
                        ...additionalData
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    return data.user;
                }
            }

            // Fetch existing profile
            return await fetchUserProfile(firebaseUser);
        } catch (error) {
            console.error("Error syncing user with backend:", error);
            return null;
        }
    };

    // Listen for Firebase auth state changes
    useEffect(() => {
        // Guard: don't attach listener if Firebase auth isn't initialized
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                const profile = await fetchUserProfile(firebaseUser);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------------------
    // Auth Methods
    // ---------------------
    const signUp = async (email: string, password: string, fullName: string, additionalData?: { role: string; companyName?: string; fundName?: string }) => {
        if (!auth) throw new Error("Firebase not initialized");
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: fullName });
        const profile = await syncUserWithBackend(credential.user, true, additionalData);
        setUserProfile(profile);
    };

    const signIn = async (email: string, password: string) => {
        if (!auth) throw new Error("Firebase not initialized");
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const profile = await fetchUserProfile(credential.user);
        setUserProfile(profile);
    };

    const signInWithGoogle = async (additionalData?: { role: string; companyName?: string; fundName?: string }) => {
        if (!auth || !googleProvider) throw new Error("Firebase not initialized");
        const credential = await signInWithPopup(auth, googleProvider);

        // Check if user already exists in backend
        let profile = await fetchUserProfile(credential.user);

        // If not, register them
        if (!profile) {
            profile = await syncUserWithBackend(credential.user, true, additionalData);
        }

        setUserProfile(profile);
    };

    const signOut = async () => {
        if (!auth) throw new Error("Firebase not initialized");
        await firebaseSignOut(auth);
        setUser(null);
        setUserProfile(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userProfile,
                loading,
                signUp,
                signIn,
                signInWithGoogle,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ---------------------
// Hook
// ---------------------
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
