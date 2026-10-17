import { Theme } from '@radix-ui/themes'
import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import MainLayout from '@/components/layout/MainLayout'
import Home from '@/pages/Home'
import NotFoundPage from '@/pages/NotFoundPage'

// split per page so the Google Maps code only loads on the branch locator
const BranchLocator = lazy(() => import('@/pages/BranchLocatorPage'))
const LoanEligibilityPage = lazy(() => import('@/pages/LoanEligibilityPage'))
const SpendingInsightsPage = lazy(() => import('@/pages/SpendingInsightsPage'))

export default function App() {
  return (
    <Theme
      appearance="light"
      accentColor="blue"
      grayColor="slate"
      radius="large"
      panelBackground="solid"
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/branch-locator" element={<BranchLocator />} />
            <Route path="/loan-eligibility" element={<LoanEligibilityPage />} />
            <Route path="/spending-insights" element={<SpendingInsightsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Theme>
  )
}
