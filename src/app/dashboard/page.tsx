import { DashboardContent } from "@/components/dashboard/DashboardContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | The Girl Next Door",
  description: "Dashboard für die TheGirlNextDoor Plattform",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
