import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "@/src/context/authContext";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StartupDeals - Exclusive Benefits for Startups",
  description:
    "Access exclusive deals and benefits on premium SaaS products for your startup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <Navbar />
            <main className="pt-16 min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
              {children}
            </main>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
