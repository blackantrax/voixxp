import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.voixxp.com"),
  alternates: { canonical: "/" },
  title: { default: "VoixXP — Studio de voix IA pour créateurs", template: "%s · VoixXP" },
  description:
    "L'alternative abordable à ElevenLabs : voix off IA en français et en anglais, générées directement dans votre navigateur. Gratuit, privé, sans limite de caractères.",
  openGraph: { title: "VoixXP — Studio de voix IA", description: "Voix off IA gratuites et privées pour créateurs de contenu.", locale: "fr_CA", type: "website", url: "https://www.voixxp.com" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA">
      <body className="min-h-screen font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
