import MainLayout from "@/components/layouts/MainLayout";

// Prevent static generation of dashboard pages that depend on AuthContext
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
