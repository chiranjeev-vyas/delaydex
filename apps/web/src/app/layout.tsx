import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackendStatus } from "@/components/backend-status";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DelayDex - Flight Delay Prediction Markets",
  description: "Decentralized prediction markets for flight delays on Monad",
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
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <BackendStatus />
          </div>
        </Providers>
      </body>
    </html>
  );
}

