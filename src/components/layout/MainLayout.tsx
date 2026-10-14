import { Outlet } from 'react-router'
import Footer from './Footer'
import Header from './Header'

export default function MainLayout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
