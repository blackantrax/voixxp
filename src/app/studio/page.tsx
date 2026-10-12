import type { Metadata } from "next";
import { Studio } from "@/components/Studio";

export const metadata: Metadata = { title: "Studio", description: "Générez des voix off IA gratuitement, directement dans votre navigateur." };

export default function StudioPage({ searchParams }: { searchParams: { voix?: string } }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Studio initialVoice={searchParams.voix} />
    </div>
  );
}
