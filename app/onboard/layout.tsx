import UserHeader from "@/components/user-header";

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <UserHeader />
      {children}
    </div>
  );
}
