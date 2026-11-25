import { useCallback, useEffect, useState } from 'react'
import Button from '../ui/Button'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import { api } from '../../lib/api'
import { useAuthModalStore } from '../../lib/stores'

const RESEND_SECONDS = 60

// Popup đăng nhập / đăng ký / nhập mã xác minh email: khách không phải rời trang. Gắn một lần trong App.
export default function AuthDialog() {
  const open = useAuthModalStore((s) => s.open)
  const view = useAuthModalStore((s) => s.view)
  const setView = useAuthModalStore((s) => s.setView)
  const close = useAuthModalStore((s) => s.close)
  // Thông tin chờ xác minh email (giữ mật khẩu trong bộ nhớ để đăng nhập luôn sau khi xác minh, không lưu đâu cả)
  const [pending, setPending] = useState(null)

  useEffect(() => { if (!open) setPending(null) }, [open])

  // Đăng nhập xong: đóng popup rồi chạy việc đang dở (nếu có)
  const done = useCallback(() => {
    const { onSuccess } = useAuthModalStore.getState()
    close()
    onSuccess?.()
  }, [close])

  const goVerify = useCallback((info) => { setPending(info); setView('verify') }, [setView])
  const title = { login: 'Đăng nhập', register: 'Đăng ký', verify: 'Xác minh email' }[view]

  return (
    <Dialog open={open} onClose={close} title={title}>
      {view === 'login' && <LoginView onDone={done} onVerify={goVerify} onSwitch={() => setView('register')} />}
      {view === 'register' && <RegisterView onDone={done} onVerify={goVerify} onSwitch={() => setView('login')} />}
      {view === 'verify' && pending && <VerifyView pending={pending} onDone={done} onBack={() => setView('login')} />}
    </Dialog>
  )
}

function LoginView({ onDone, onVerify, onSwitch }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.login(form.username.trim(), form.password)
      onDone()
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') onVerify({ username: form.username.trim(), password: form.password })
      else setError(loginMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <Input label="Tên đăng nhập" name="username" autoComplete="username" autoFocus required maxLength={100} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <Input label="Mật khẩu" name="password" type="password" autoComplete="current-password" required maxLength={72} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <p role="alert" className="font-medium text-red-600">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</Button>
      <p className="text-center text-sm">Chưa có tài khoản? <button type="button" className="font-bold underline" onClick={onSwitch}>Đăng ký</button></p>
    </form>
  )
}

function RegisterView({ onDone, onVerify, onSwitch }) {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const field = (k) => ({ name: k, value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })
  const mismatch = form.confirm && form.confirm !== form.password

  const submit = async (e) => {
    e.preventDefault()
    if (mismatch) return
    setError('')
    setBusy(true)
    const username = form.username.trim()
    try {
      await api.signup({ username, password: form.password, fullName: form.fullName.trim(), email: form.email.trim() })
    } catch (err) {
      setError(signupMessage(err))
      setBusy(false)
      return
    }
    try {
      // signup không trả token: đăng nhập ngay; chưa xác minh email thì chuyển sang bước nhập mã
      await api.login(username, form.password)
      onDone()
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') onVerify({ username, password: form.password, email: form.email.trim() })
      else setError(loginMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <Input label="Họ tên" required autoFocus maxLength={255} autoComplete="name" {...field('fullName')} />
      <Input label="Tên đăng nhập" required minLength={3} maxLength={100} autoComplete="username" {...field('username')} />
      <Input label="Email" type="email" required maxLength={255} autoComplete="email" {...field('email')} />
      <Input label="Mật khẩu" type="password" required minLength={8} maxLength={72} autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" {...field('password')} />
      <Input label="Nhập lại mật khẩu" type="password" required autoComplete="new-password" error={mismatch ? 'Mật khẩu nhập lại không khớp' : undefined} {...field('confirm')} />
      {error && <p role="alert" className="font-medium text-red-600">{error}</p>}
      <Button type="submit" disabled={busy || mismatch}>{busy ? 'Đang tạo...' : 'Tạo tài khoản'}</Button>
      <p className="text-center text-sm">Đã có tài khoản? <button type="button" className="font-bold underline" onClick={onSwitch}>Đăng nhập</button></p>
    </form>
  )
}

function VerifyView({ pending, onDone, onBack }) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [wait, setWait] = useState(RESEND_SECONDS)

  // Thư vừa được gửi: khóa nút "Gửi lại" 60 giây (identity giãn cách tối thiểu 60 giây giữa hai lần gửi)
  useEffect(() => {
    if (wait <= 0) return undefined
    const id = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      await api.verifyEmail({ username: pending.username, otp })
    } catch (err) {
      setError(err.code === 'EMAIL_VERIFICATION_FAILED' ? 'Mã không đúng hoặc đã hết hạn. Hãy kiểm tra lại hoặc gửi lại mã.' : err.message)
      setBusy(false)
      return
    }
    try {
      await api.login(pending.username, pending.password)
      onDone()
    } catch (err) {
      setError(loginMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setError('')
    try {
      await api.resendVerification({ username: pending.username })
      setInfo('Nếu tài khoản đang chờ xác minh, mã mới sẽ được gửi tới email của bạn.')
      setWait(RESEND_SECONDS)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <p className="text-sm">Chúng tôi đã gửi mã xác minh 6 chữ số tới email{pending.email ? <> <span className="font-bold">{pending.email}</span></> : ' của tài khoản'}. Nhập mã để hoàn tất.</p>
      <Input label="Mã xác minh" name="otp" required inputMode="numeric" autoComplete="one-time-code" autoFocus pattern="\d{6}" maxLength={6} placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
      {error && <p role="alert" className="font-medium text-red-600">{error}</p>}
      {info && <p role="status" className="text-sm font-medium">{info}</p>}
      <Button type="submit" disabled={busy || otp.length !== 6}>{busy ? 'Đang xác minh...' : 'Xác minh'}</Button>
      <div className="flex items-center justify-between text-sm">
        <button type="button" className="font-bold underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60" disabled={wait > 0} onClick={resend}>{wait > 0 ? `Gửi lại mã sau ${wait}s` : 'Gửi lại mã'}</button>
        <button type="button" className="font-bold underline" onClick={onBack}>Quay lại đăng nhập</button>
      </div>
    </form>
  )
}

// ---- Hằng số, bảng nhãn và tiện ích ----

function loginMessage(err) {
  return err.code === 'LOGIN_FAILED'
    ? 'Sai tên đăng nhập hoặc mật khẩu. Nếu vẫn lỗi, hãy thử lại sau ít phút hoặc liên hệ cửa hàng.'
    : err.message
}

function signupMessage(err) {
  return ({
    DUPLICATE_USERNAME: 'Tên đăng nhập hoặc email đã được sử dụng.',
    SIGNUP_NOT_AVAILABLE: 'Cửa hàng hiện không mở đăng ký.',
    VALIDATION_FAILED: 'Thông tin chưa hợp lệ: tên đăng nhập 3–100 ký tự, mật khẩu 8–72 ký tự, email đúng định dạng.',
  })[err.code] || err.message
}
