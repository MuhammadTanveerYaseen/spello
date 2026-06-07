"use client";

import AppLogo from "@/components/AppLogo";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm safe-top">
      <div className="mx-auto max-w-md px-5 py-3">
        <AppLogo size="sm" />
      </div>
    </header>
  );
}
