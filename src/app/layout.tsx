import type { Metadata } from "next";
import { Geist, Jost } from "next/font/google";
import "./globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ReactQueryProvider from "@/components/react-query-provider";
import { SonnerToaster } from "@/components/sonner-provider";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const jost = Jost({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NextJS - Elysia stater",
  description: "NextJS - Elysia stater kit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={jost.className}>
        <ReactQueryProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
          <SonnerToaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
