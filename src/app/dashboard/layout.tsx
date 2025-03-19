import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | The Girl Next Door",
  description: "Dashboard für die TheGirlNextDoor Plattform",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 