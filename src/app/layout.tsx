"use client";
import "./globals.css";
import AuthHandler from "./components/AuthHandler";
import Navbar from "./components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthHandler>
          <Navbar />
          {children}
        </AuthHandler>
      </body>
    </html>
  );
}
