import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Crypto Frontier",
  description: "Seu portal de notícias sobre criptomoedas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
