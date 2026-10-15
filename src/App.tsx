import { BrowserRouter, Routes, Route } from 'react-router'
import MainLayout from '@/components/layout/MainLayout'

import Home from '@/pages/Home'
import BranchLocator from '@/pages/BranchLocatorPage'
import LoanEligibilityPage from '@/pages/LoanEligibilityPage'
import SpendingInsightsPage from '@/pages/SpendingInsightsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/branch-locator" element={<BranchLocator />} />
          <Route path="/loan-eligibility" element={<LoanEligibilityPage />} />
          <Route path="/spending-insights" element={<SpendingInsightsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
