import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Docto — AI-Powered Medical Productivity Suite",
    template: "%s | Docto",
  },
  description:
    "Docto is an AI-powered medical productivity platform for doctors and patients. Research hub, smart planner, clinical sessions, and medication tracking — all in one place.",
  keywords: [
    "medical",
    "healthcare",
    "AI",
    "doctor",
    "patient",
    "prescription",
    "telemedicine",
    "clinical",
  ],
  authors: [{ name: "Docto Team" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Docto — AI-Powered Medical Productivity Suite",
    description:
      "Research, diagnose, prescribe, and track — all powered by AI. Built for Indian healthcare.",
    siteName: "Docto",
  },
};

import { AuthListener } from "@/components/shared/auth-listener";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
