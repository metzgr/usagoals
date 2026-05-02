import type { Metadata } from "next";
import localFont from "next/font/local";

import { SiteHeader } from "@/components/site/site-header";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const neueMontreal = localFont({
  src: [
    {
      path: "./fonts/Neue Montreal/NeueMontreal-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Neue Montreal/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Neue Montreal/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Neue Montreal/NeueMontreal-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Neue Montreal/NeueMontreal-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/Neue Montreal/NeueMontreal-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/Neue Montreal/NeueMontreal-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/Neue Montreal/NeueMontreal-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});

const copernicusNewCond = localFont({
  src: [
    {
      path: "./fonts/Copernicus New Cond/CopernicusNewCond-070.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-copernicus-new-cond",
  display: "swap",
});

const copernicusNewCond130 = localFont({
  src: [
    {
      path: "./fonts/Copernicus New Cond/CopernicusNewCond-130.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-copernicus-new-cond-130",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "USA Goals",
    template: "%s | USA Goals",
  },
  description: "Browse federal plans, goals, indicators, themes, and agency owners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${neueMontreal.variable} ${copernicusNewCond.variable} ${copernicusNewCond130.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
