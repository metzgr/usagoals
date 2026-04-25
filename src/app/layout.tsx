import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
      className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
