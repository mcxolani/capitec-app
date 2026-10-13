import { BrowserRouter, Routes, Route, Link } from 'react-router'

import Home from '@/pages/Home'
import BranchLocator from '@/pages/BranchLocator'

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/branch-locator">Branch Locator</Link>
          </li>
          <li>
            <Link to="/loan-eligibility">Loan Eligibility</Link>
          </li>
          <li>
            <Link to="/spending-insights">Spending Insights</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/branch-locator" element={<BranchLocator />} />
      </Routes>
    </BrowserRouter>
  )
}
