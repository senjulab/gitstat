import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Databuddy } from "@databuddy/sdk/react";
import { getURL } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: "Gitstat - Analytics for your gitHub repos",
  description:
    "GitHub repo analytics made simple. track stars, commits, traffic, and more.",
  openGraph: {
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`antialiased bg-white font-sans`}>
        {children}
        <Databuddy clientId="5a2ea5ac-f598-4b28-8ba4-76f3610111cc" />
      </body>
    </html>
  );
}
