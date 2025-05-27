import { Providers } from "./providers"
import "../css/main.css"

export const metadata = {
  title: 'The Crypto Frontier',
  description: 'Notícias e conteúdo sobre criptomoedas e blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="light">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
