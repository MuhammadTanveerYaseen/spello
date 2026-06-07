import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="mx-auto min-h-dvh max-w-md">
        <AppHeader />
        <main className="page-container !pt-4">{children}</main>
        <InstallPrompt />
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
