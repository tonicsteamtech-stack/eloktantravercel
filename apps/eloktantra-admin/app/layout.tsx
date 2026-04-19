import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import AuthProvider from "@/components/AuthProvider";
import React from "react";

export const metadata: Metadata = {
  title: "eLoktantra Admin Portal",
  description: "Secure digital voting platform management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
