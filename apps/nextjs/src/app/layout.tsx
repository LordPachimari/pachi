import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "~/components/ui/toaster";
import { ThemeProvider } from "~/providers/theme-provider";

import "~/styles/globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Pachi",
  description: "The global e-commerce store",
  openGraph: {
    title: "The global e-commerce store",
    description: "The global e-commerce store",
    url: "https://pachi.vercel.app",
    siteName: "Pachi",
  },
  twitter: {
    card: "summary_large_image",
    site: "@pachi",
    creator: "@pachimari",
  },
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={["font-sans", fontSans.variable].join(" ")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {props.children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
