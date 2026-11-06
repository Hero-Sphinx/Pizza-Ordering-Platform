import type { Metadata, Viewport } from "next";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const baloo = Baloo_2({ variable: "--font-baloo", subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Demo Pizzeria | Pizza Ordering Platform demo",
    template: "%s | Demo Pizzeria",
  },
  description:
    "A demo restaurant for the Pizza Ordering Platform: menu, live prices, pickup or delivery, and a live kitchen board.",
  openGraph: {
    type: "website",
    siteName: "Demo Pizzeria",
    images: [{ url: "/images/promos/pizzas.webp", width: 900, height: 596 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#148043",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA" className={`${inter.variable} ${baloo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
