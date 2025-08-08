import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { Toaster } from "sonner";

const apricot = localFont({
  src: "../public/fonts/apricot.otf",
  variable: "--font-apricot",
  display: "swap",
});

const handy = localFont({
  src: "../public/fonts/handy.otf",
  variable: "--font-handy",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniSched",
  description: "Upload. Edit. Own your class schedule. Schedule made easy.",
  icons: {
    icon: "/calendar.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/calendar.png" sizes="any" />

        <title>UniSched | AI-Powered Class Scheduler</title>
        <meta name="title" content="UniSched | AI-Powered Class Scheduler" />
        <meta
          name="description"
          content="Upload your COR PDF and instantly generate a beautiful, editable class schedule. Choose your design, make changes, and save it your way."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="http://unisched.vercel.app/" />
        <meta
          property="og:title"
          content="UniSched | AI-Powered Class Scheduler"
        />
        <meta
          property="og:description"
          content="Upload your COR PDF and instantly generate a beautiful, editable class schedule. Choose your design, make changes, and save it your way."
        />
        <meta
          property="og:image"
          content="https://unisched.com/thumbnail.png"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="http://unisched.vercel.app/" />
        <meta
          property="twitter:title"
          content="UniSched | AI-Powered Class Scheduler"
        />
        <meta
          property="twitter:description"
          content="Upload your COR PDF and instantly generate a beautiful, editable class schedule. Choose your design, make changes, and save it your way."
        />
        <meta
          property="twitter:image"
          content="https://unisched.com/thumbnail.png"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${apricot.variable} ${handy.variable} antialiased`}
      >
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
