import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin — Kaasha by Vallari Shah",
  robots: { index: false, follow: false }
};

export default function AdminPage() {
  return <AdminDashboard />;
}
