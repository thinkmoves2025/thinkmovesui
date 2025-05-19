"use client";
import "./globals.css";
import AuthHandler from "./components/AuthHandler";
import Navbar from "./components/Navbar";
import React, { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state while checking auth
  if (!isClient) {
    return (
      <html lang="en">
        <body>
          <div>Loading...</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <Navbar />
        <AuthHandler>{children}</AuthHandler>
      </body>
    </html>
  );
}  


