import { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata:Metadata = {
  title: "Dreamdoor",
  description: "Welcome to Dreamdoor — Your gateway to smart inventory management.", 
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}
      <Toaster position="top-right" />
      </body>
    </html>
  );
}
