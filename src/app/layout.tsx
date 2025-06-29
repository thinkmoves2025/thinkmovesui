"use client";
import "./globals.css";
import AuthHandler from "./components/AuthHandler";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNavbar = pathname !== "/view-position";

  return (
    <html lang="en">
      <body>
        <AuthHandler>
          {showNavbar && <Navbar />}
          {children}
        </AuthHandler>
      </body>
    </html>
  );
}
