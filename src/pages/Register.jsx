import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const from = typeof location.state?.from === 'string' && location.state.from.startsWith('/') ? location.state.from : '/'
  const field = (k) => ({ name: k, value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })
  const mismatch = form.confirm && form.confirm !== form.password

  const submit = async (e) => {
    e.preventDefault()
    if (mismatch) return
    setError('')
    setBusy(true)
    try {
      await api.signup({ username: form.username.trim(), password: form.password, fullName: form.fullName.trim(), email: form.email.trim() })
      // signup không trả token: đăng nhập ngay để khách đi tiếp
      await login(form.username.trim(), form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(({
        DUPLICATE_USERNAME: 'Tên đăng nhập hoặc email đã được sử dụng.',
        SIGNUP_NOT_AVAILABLE: 'Cửa hàng hiện không mở đăng ký.',
        VALIDATION_FAILED: 'Thông tin chưa hợp lệ: tên đăng nhập 3–100 ký tự, mật khẩu 8–72 ký tự, email đúng định dạng.',
      })[err.code] || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-8">
      <Card className="flex flex-col gap-5 p-6">
        <div>
          <h1 className="text-3xl">Đăng ký</h1>
          <p className="mt-1 text-ink/70">Tạo tài khoản để mua sách.</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <Input label="Họ tên" required maxLength={255} autoComplete="name" {...field('fullName')} />
          <Input label="Tên đăng nhập" required minLength={3} maxLength={100} autoComplete="username" {...field('username')} />
          <Input label="Email" type="email" required maxLength={255} autoComplete="email" {...field('email')} />
          <Input label="Mật khẩu" type="password" required minLength={8} maxLength={72} autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" {...field('password')} />
          <Input label="Nhập lại mật khẩu" type="password" required autoComplete="new-password" error={mismatch ? 'Mật khẩu nhập lại không khớp' : undefined} {...field('confirm')} />
          {error && <p role="alert" className="font-medium text-red-600">{error}</p>}
          <Button type="submit" className="mt-2" disabled={busy || mismatch}>{busy ? 'Đang tạo...' : 'Tạo tài khoản'}</Button>
        </form>
        <p className="text-center text-sm">Đã có tài khoản? <Link to="/login" state={location.state} className="font-bold underline">Đăng nhập</Link></p>
      </Card>
    </div>
  )
}
