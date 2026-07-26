'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const isLoginPage = pathname === '/' || pathname === '/login' || pathname === '/auth' || pathname?.startsWith('/auth/')

  return (
    <html lang="vi">
      <head>
        <title>Hệ thống nghiệp vụ công tác Đoàn khoa Công nghệ Phần mềm (UIT-VNUHCM)</title>
        <meta name="description" content="Đoàn TNCS Hồ Chí Minh" />
        <link rel="icon" href="/LOGO-DAIHOI-V.png?v=100" />
        <link rel="shortcut icon" href="/LOGO-DAIHOI-V.png?v=100" />
        <link rel="apple-touch-icon" href="/LOGO-DAIHOI-V.png?v=100" />
      </head>
      <body className={`${inter.className} antialiased m-0 p-0 bg-white text-slate-900`}>
        {isLoginPage ? (
          <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
            {children}
          </div>
        ) : (
          <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                <div className="mx-auto max-w-[1600px] min-h-full">
                  {children}
                </div>
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  )
}