import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StoreProvider from '@/components/providers/StoreProvider'

export const metadata: Metadata = {
  title: 'متجر الجملة - بيع إكسسوارات الهواتف بالجملة',
  description: 'متجر متخصص في بيع إكسسوارات الهواتف بالجملة في جميع ولايات الجزائر',
  keywords: 'جملة, إكسسوارات, هواتف, الجزائر, wholesale, phone accessories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <StoreProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  )
}
