import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono, Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "USA Goals",
    template: "%s | USA Goals",
  },
  description:
    "Investor-facing prototype for exploring the live federal strategy corpus exposed by APEX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "font-sans",
        "antialiased",
        bodyFont.variable,
        displayFont.variable,
        monoFont.variable,
        geist.variable,
      )}
    >
      <body className="min-h-full">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col px-4 py-6 sm:px-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
