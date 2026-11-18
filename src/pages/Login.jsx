import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { useAuth } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const from = typeof location.state?.from === 'string' && location.state.from.startsWith('/') ? location.state.from : '/'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(form.username.trim(), form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.code === 'LOGIN_FAILED'
        ? 'Sai tên đăng nhập hoặc mật khẩu. Nếu vẫn lỗi, hãy thử lại sau ít phút hoặc liên hệ cửa hàng.'
        : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-8">
      <Card className="flex flex-col gap-5 p-6">
        <div>
          <h1 className="text-3xl">Đăng nhập</h1>
          <p className="mt-1 text-ink/70">Chào mừng bạn quay lại BookNook!</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <Input label="Tên đăng nhập" name="username" autoComplete="username" required maxLength={100} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input label="Mật khẩu" name="password" type="password" autoComplete="current-password" required maxLength={72} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p role="alert" className="font-medium text-red-600">{error}</p>}
          <Button type="submit" className="mt-2" disabled={busy}>{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</Button>
        </form>
        <p className="text-center text-sm">Chưa có tài khoản? <Link to="/register" state={location.state} className="font-bold underline">Đăng ký</Link></p>
      </Card>
    </div>
  )
}
