import AppLogo from "@/components/AppLogo";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <AppLogo size="lg" showText={false} />
      <h1 className="mt-6 text-xl font-bold">You&apos;re offline</h1>
      <p className="mt-2 text-sm text-slate-400">
        Reconnect to the internet to sync your data.
      </p>
      <Link href="/" className="btn-primary mt-6 text-sm">
        Try again
      </Link>
    </div>
  );
}
