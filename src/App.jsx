import { useEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import AuthDialog from './components/auth/AuthDialog'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import BookDetail from './pages/BookDetail'
import Books from './pages/Books'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import MyOrders from './pages/MyOrders'
import NotFound from './pages/NotFound'
import Payment from './pages/Payment'
import { useAuth } from './lib/auth'
import { useAuthModalStore } from './lib/stores'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// /login và /register mở popup ngay trên trang chủ (không có trang riêng); đăng nhập xong về trang đã định (state.from) hoặc trang chủ.
function OpenAuth({ view }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = typeof location.state?.from === 'string' && location.state.from.startsWith('/') && !location.state.from.startsWith('//') ? location.state.from : '/'
  useEffect(() => {
    if (user) navigate(from, { replace: true })
    else useAuthModalStore.getState().show(view, () => navigate(from, { replace: true }))
  }, [user, view, from, navigate])
  return null
}

function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer flush={pathname === '/'} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<><Home /><OpenAuth view="login" /></>} />
          <Route path="/register" element={<><Home /><OpenAuth view="register" /></>} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/orders/:id/payment" element={<Payment />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <AuthDialog />
    </BrowserRouter>
  )
}
