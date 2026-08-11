import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { format } from "date-fns";
import { APP_VERSION, COMMIT_DATE } from "@/lib/buildInfo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const buildStamp = COMMIT_DATE ? format(new Date(COMMIT_DATE), "yyyy-MM-dd HH:mm") : "unknown";

export const metadata: Metadata = {
  title: `Timebox Planner v${APP_VERSION} (${buildStamp})`,
  description: "Timebox Planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
