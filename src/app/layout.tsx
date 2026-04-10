import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEIF Attendance",
  description: "Attendance and day-off tracking system for LEIF"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
