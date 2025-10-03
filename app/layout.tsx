import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
});

export const metadata: Metadata = {
  title: "Dolci Rêva",
  description: "La Côte d'Ivoire regorge d'énormes potentialités, permettant ainsi la pratique du tourisme. Mais, toutes ces richesses restent méconnus de la plupart des ivoiriens et des touristes étrangers. Dolci Rêva vous aidera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rajdhani.variable} antialiased`}
      >
        <Toaster richColors position="top-right" />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
