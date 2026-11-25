import { useCallback, useMemo } from 'react'
import { api } from './api'
import { useAuthModalStore, useSessionStore } from './stores'

// user = null khi chưa đăng nhập. Component tự cập nhật khi đăng nhập/đăng xuất/làm mới phiên.
// `user` phải ổn định giữa các lần render (nhiều nơi dùng nó làm dependency của effect/useAsync).
export function useAuth() {
  const username = useSessionStore((s) => s.session?.username)
  const user = useMemo(() => (username ? { username } : null), [username])
  return { user, login: api.login, logout: api.logout }
}

// requireLogin(then): đã đăng nhập thì chạy `then` ngay; chưa thì mở popup đăng nhập và chạy `then` sau khi đăng nhập xong
// (khách không phải rời trang). `then` phải đọc trạng thái mới nhất (getState), không dùng giá trị đã chụp lúc chưa đăng nhập.
export function useRequireLogin() {
  const username = useSessionStore((s) => s.session?.username)
  const show = useAuthModalStore((s) => s.show)
  return useCallback((then) => {
    if (username) then()
    else show('login', then)
  }, [username, show])
}
