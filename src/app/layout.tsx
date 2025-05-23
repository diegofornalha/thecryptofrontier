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
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
