import type { Metadata } from "next";
import BookingReturnClient from "@/components/BookingReturnClient";

export const metadata: Metadata = {
  title: "Confirming your booking — Kaasha by Vallari Shah",
  robots: { index: false, follow: false }
};

export default function BookingReturnPage() {
  return (
    <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <BookingReturnClient />
      </div>
    </main>
  );
}
