import { DashboardHeader } from "../components/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader />
      <main className="pt-20">{children}</main>
    </div>
  );
}
