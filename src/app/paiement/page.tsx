import type { Metadata } from "next";
import { PaymentWaiter } from "@/components/PaymentWaiter";

export const metadata: Metadata = { title: "Validation du paiement", robots: { index: false } };

export default function Paiement({ searchParams }: { searchParams: { ref?: string } }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <PaymentWaiter reference={searchParams.ref ?? ""} />
    </div>
  );
}
