"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const hasBottomNav = pathname !== "/";

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone);
    setIsStandalone(!!standalone);

    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    if (localStorage.getItem("pwa-install-dismissed")) setDismissed(true);

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "1");
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (isStandalone || dismissed) return null;

  const position = hasBottomNav ? "bottom-[4.75rem]" : "bottom-4";

  if (deferredPrompt) {
    return (
      <div className={`fixed ${position} left-3 right-3 z-40 mx-auto max-w-md safe-bottom`}>
        <div className="card flex items-center gap-3 border-blue-800 bg-slate-800 p-3 shadow-lg">
          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[22%] border border-slate-600 bg-slate-900">
            <span className="text-[10px] font-bold text-blue-500">SC</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Install Spello App</p>
            <p className="text-xs text-slate-400">Add to home screen</p>
          </div>
          <button type="button" onClick={install} className="btn-primary shrink-0 px-3 py-1.5 text-xs">
            Install
          </button>
          <button type="button" onClick={dismiss} className="shrink-0 px-1 text-slate-500" aria-label="Dismiss">
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className={`fixed ${position} left-3 right-3 z-40 mx-auto max-w-md safe-bottom`}>
        <div className="card border-blue-800 bg-slate-800 p-3 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Install on iPhone</p>
              <p className="mt-1 text-xs text-slate-400">
                Tap <span className="font-medium text-white">Share</span> →{" "}
                <span className="font-medium text-white">Add to Home Screen</span>
              </p>
            </div>
            <button type="button" onClick={dismiss} className="shrink-0 text-slate-500" aria-label="Dismiss">
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
