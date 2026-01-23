import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Databuddy } from "@databuddy/sdk/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gistat - Analytics for your gitHub repos",
  description:
    "GitHub repo analytics made simple. track stars, commits, traffic, and more.",
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
        <Databuddy
          clientId="5a2ea5ac-f598-4b28-8ba4-76f3610111cc"
          trackHashChanges={true}
          trackAttributes={true}
          trackOutgoingLinks={true}
          trackInteractions={true}
          trackScrollDepth={true}
          trackWebVitals={true}
          trackErrors={true}
        />
      </body>
    </html>
  );
}
