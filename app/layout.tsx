import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ScreenSaver from "@/components/ScreenSaver";

export const metadata: Metadata = {
  title: "A2F",
  description: "Interactive atlas documenting Korean footballers' overseas careers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navigation />
        {children}
        <ScreenSaver />
      </body>
    </html>
  );
}
