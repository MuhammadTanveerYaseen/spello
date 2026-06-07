import type { Metadata, Viewport } from "next";
import { Geist, Libre_Baskerville } from "next/font/google";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const logoFont = Libre_Baskerville({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Spello Cafe — Construction Expenses",
  description: "Professional construction expense & investor funding for Spello Cafe",
  applicationName: "Spello Cafe",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Spello",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${logoFont.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
