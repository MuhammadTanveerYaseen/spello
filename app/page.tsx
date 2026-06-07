"use client";

import AppLogo from "@/components/AppLogo";
import AuthForm from "@/components/AuthForm";
import InstallPrompt from "@/components/InstallPrompt";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/verify")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace("/dashboard");
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AppLogo size="lg" showText={false} />
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 safe-top safe-bottom">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <AppLogo size="lg" showText={false} />
          <h1 className="mt-4 text-2xl font-bold">Spello Cafe</h1>
          <p className="mt-1 text-sm text-slate-400">Construction Expense Management</p>
        </div>

        <div className="card p-6">
          <h2 className="mb-1 text-lg font-semibold">Secure Access</h2>
          <p className="mb-5 text-sm text-slate-400">
            Enter your security key to continue.
          </p>
          <AuthForm />
        </div>
      </div>
      <InstallPrompt />
    </div>
  );
}
