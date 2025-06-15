import { Providers } from "./providers"
import GoogleAnalytics from "@/components/google-analytics"
import GoogleTagManager, { GoogleTagManagerNoscript } from "@/components/google-tag-manager"
import "../css/main.css"

export const metadata = {
  title: 'The Crypto Frontier',
  description: 'Notícias e conteúdo sobre criptomoedas e blockchain',
  metadataBase: new URL('https://thecryptofrontier.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = 'G-SFGD9XKTLD'
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || ''

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
        <GoogleTagManagerNoscript gtmId={gtmId} />
        <Providers>{children}</Providers>
        <GoogleAnalytics measurementId={gaId} />
        <GoogleTagManager gtmId={gtmId} />
      </body>
    </html>
  )
}
