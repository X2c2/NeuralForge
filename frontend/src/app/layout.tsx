import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NeuralForge - Where AI Creators Unite',
  description: 'The ultimate AI platform for creators, developers, and innovators. Access multiple AI models, share your creations, and build the future together.',
  keywords: 'AI, artificial intelligence, machine learning, creators, platform, GPT, Claude, Gemini',
  authors: [{ name: 'NeuralForge Team' }],
  openGraph: {
    title: 'NeuralForge - Where AI Creators Unite',
    description: 'The ultimate AI platform for creators, developers, and innovators.',
    url: 'https://neuralforge.to',
    siteName: 'NeuralForge',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NeuralForge - AI Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuralForge - Where AI Creators Unite',
    description: 'The ultimate AI platform for creators, developers, and innovators.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
