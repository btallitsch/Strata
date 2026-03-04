import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitnessIQ — Fitness Intelligence Platform",
  description:
    "A unified fitness decision engine. Not just a tracker — it explains why numbers change, models tradeoffs, and adapts to your behavior.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
