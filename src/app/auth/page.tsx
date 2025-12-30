"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // While auth is loading, or if the user is already logged in, show a loader.
  // The useEffect above will handle redirection.
  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Only render the AuthForm when we know there's no user and auth is ready.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
       <div className="absolute top-8 left-8">
        <Link href="/">
            <Logo />
        </Link>
       </div>
      <AuthForm />
    </div>
  );
}
