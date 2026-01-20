import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gistat - Analytics for your gitHub repos",
  description: "GitHub repo analytics made simple. track stars, commits, traffic, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        {children}
      </body>
    </html>
  );
}
