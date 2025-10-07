import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { ExerciceProvider } from "@/contexts/ExerciceContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ChatPopupContainer } from "@/components/agents/ChatPopupContainer";
import { FloatingChatButton } from "@/components/agents/FloatingChatButton";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Norm Paie - Système de Gestion de Paie",
  description: "Système de gestion de paie professionnel pour le Congo Brazzaville",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          <ExerciceProvider>
            <ChatProvider>
              {children}
              <ChatPopupContainer />
              <FloatingChatButton />
              <Toaster />
            </ChatProvider>
          </ExerciceProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
