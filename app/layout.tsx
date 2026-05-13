import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './components/AuthProvider'
import Header from './components/Header'
import Footer from './components/Footer'
import { BASE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'The Integrity Wiki — Fact-checked Political Transparency',
    template: '%s | The Integrity Wiki',
  },
  description:
    'A crowdsourced, fact-checked political campaign finance integrity index. Track politicians\' financial interests, PAC money, stock trades, and corruption pledges across federal, state, and local elections.',
  keywords: [
    'political integrity',
    'campaign finance',
    'PAC money',
    'stock trading ban',
    'political transparency',
    'election finance',
    'Open source',
    'Fact-checked'
  ],
  openGraph: {
    title: 'The Integrity Wiki',
    description: 'Crowdsourced, fact-checked political campaign finance transparency for every level of government.',
    type: 'website',
    locale: 'en_US',
    siteName: 'The Integrity Wiki',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <AuthProvider>
          <div className="page-wrapper">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
