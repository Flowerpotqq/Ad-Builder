import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

/** Authenticated dashboard layout with sidebar and header */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nap-shell bg-page-soft">
      <Sidebar />
      <Header />
      <main className="ml-64 mt-16 min-h-[calc(100vh-4rem)] p-6 lg:p-8">{children}</main>
    </div>
  );
}
