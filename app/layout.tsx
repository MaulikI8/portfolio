// Root layout component - sets up fonts, metadata, and global structure
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

// Inter for body text - clean and readable
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Prevents font swap flash
})

// Poppins for headings - more personality and modern feel
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'], // Multiple weights for design flexibility
  variable: '--font-poppins',
  display: 'swap',
})

// SEO metadata - crucial for discoverability and social sharing
export const metadata: Metadata = {
  title: 'Maulik Joshi - Backend-Focused Full-Stack Developer',
  description: 'Building Scalable Systems & Seamless Web Experiences. Backend-focused full-stack developer passionate about building modern web apps that are fast, secure, and reliable.',
  keywords: ['Maulik Joshi', 'Full Stack Developer', 'Backend Developer', 'JavaScript', 'Python', 'Java', 'Web Development', 'Portfolio'],
  authors: [{ name: 'Maulik Joshi' }],
  creator: 'Maulik Joshi',
  publisher: 'Maulik Joshi',
  // Disable automatic format detection for cleaner URLs
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://maulikjoshi.dev'),
  alternates: {
    canonical: '/',
  },
  // Open Graph for social media sharing
  openGraph: {
    title: 'Maulik Joshi - Backend-Focused Full-Stack Developer',
    description: 'Building Scalable Systems & Seamless Web Experiences. Backend-focused full-stack developer passionate about building modern web apps.',
    url: 'https://maulikjoshi.dev',
    siteName: 'Maulik Joshi Portfolio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maulik Joshi - Full Stack Developer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  // Twitter Card for better Twitter sharing
  twitter: {
    card: 'summary_large_image',
    title: 'Maulik Joshi - Backend-Focused Full-Stack Developer',
    description: 'Building Scalable Systems & Seamless Web Experiences.',
    images: ['/og-image.jpg'],
  },
  // Search engine optimization settings
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-body antialiased`}>
        {children}
        {/* Google Analytics for tracking - using environment variable for security */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'} />
      </body>
    </html>
  )
}
