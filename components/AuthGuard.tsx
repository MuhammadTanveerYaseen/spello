"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/verify")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.replace("/");
        } else {
          setReady(true);
        }
      })
      .catch(() => router.replace("/"));
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
