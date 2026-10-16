import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router'
import ErrorBoundary from '@/components/ErrorBoundary'
import Footer from './Footer'
import Header from './Header'
import '@/components/layout/layout.css'

export default function MainLayout() {
  const { pathname } = useLocation()

  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        {/* keyed by path so navigating away from a crashed page recovers */}
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<p className="page-loading">Loading…</p>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
