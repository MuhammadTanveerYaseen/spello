import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <main className="page-container">{children}</main>
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
