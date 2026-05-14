import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyPulse",
  description: "StudyPulse",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.15.0/tabler-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
