import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rishi Gurjar",
  description: "Rishi Gurjar | Gardening and crafting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <link
          rel="stylesheet"
          href="https://cdn.locadapt.com/locadapt.min.css"
      />
      <script
          src="https://cdn.locadapt.com/locadapt.min.js"
          data-project-id="85466916-e58a-461c-8ca7-5bbb38af4d92"
          data-ssr-defer
          defer
      />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
