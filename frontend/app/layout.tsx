import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navigation/navbar'
import { WalletProvider } from '@/components/wallet/wallet-connect'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EcoNexus - Regenerative Impact Marketplace',
  description: 'Connect local environmental actions to global ReFi markets through Hedera Guardian',
  keywords: 'sustainability, carbon credits, biodiversity, ReFi, Hedera, blockchain',
  authors: [{ name: 'EcoNexus Team' }],
  openGraph: {
    title: 'EcoNexus - Regenerative Impact Marketplace',
    description: 'Connect local environmental actions to global ReFi markets',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main>{children}</main>
          </div>
        </WalletProvider>
      </body>
    </html>
  )
}
