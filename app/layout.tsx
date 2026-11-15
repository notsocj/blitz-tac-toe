import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Array is self-hosted under the ITF Free Font License (see app/fonts/Array-LICENSE.txt).
const array = localFont({
  variable: "--font-array",
  src: [
    { path: "./fonts/Array-Semibold.woff2", weight: "600" },
    { path: "./fonts/Array-Bold.woff2", weight: "700" },
  ],
});

const arrayWide = localFont({
  variable: "--font-array-wide",
  src: "./fonts/Array-BoldWide.woff2",
  weight: "700",
});

const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blitz Tac Toe",
  description: "Tic-tac-toe on a chess clock. Get three in a row before your time runs out.",
};

export const viewport: Viewport = { themeColor: "#2447e6" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} ${array.variable} ${arrayWide.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
