import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../store/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Algo Trader",
  description: "Algorithmic trading platform with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-800 text-white`} // Dodane kolory tła i tekstu dla lepszej widoczności
      >
        <AuthProvider> {/* <-- DODANE: Opakowanie dzieci w AuthProvider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
