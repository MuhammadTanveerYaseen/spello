"use client";

import AppLogo from "@/components/AppLogo";
import AuthForm from "@/components/AuthForm";
import InstallPrompt from "@/components/InstallPrompt";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/verify")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) router.replace("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 safe-top safe-bottom">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <AppLogo
            size="lg"
            align="center"
            tagline="Construction Expenses"
          />
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
