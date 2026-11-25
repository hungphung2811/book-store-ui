import { useEffect } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { useAuthModalStore } from '../../lib/stores'

// Trang cần đăng nhập: tự mở popup đăng nhập một lần; đóng popup rồi thì còn nút mở lại (khách không bị đẩy sang trang khác).
export default function LoginPrompt() {
  const show = useAuthModalStore((s) => s.show)
  useEffect(() => { show('login') }, [show])
  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
      <p className="text-xl font-bold">Vui lòng đăng nhập để tiếp tục</p>
      <div className="flex gap-2">
        <Button onClick={() => show('login')}>Đăng nhập</Button>
        <Button variant="secondary" onClick={() => show('register')}>Đăng ký</Button>
      </div>
    </Card>
  )
}
