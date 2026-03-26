import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Community Board - Share & Discuss",
  description: "A lightweight community board for sharing posts, comments, and discussions",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 text-center text-gray-600 text-sm">
            <p>© 2025 Community Board. Built with Next.js & Prisma.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
