// Nội dung tĩnh của cửa hàng: chính sách và câu hỏi thường gặp. Không chứa số liệu kinh doanh hay đánh giá khách.
export const ticker = [
  'Nhận hàng tại cửa hàng hoặc giao tận nơi',
  'Thanh toán khi nhận hàng (COD) cho đơn giao tận nơi',
  'Hủy đơn miễn phí khi đơn đang chờ xác nhận',
  'Tra cứu đơn hàng bất cứ lúc nào trong mục Đơn hàng',
]

export const perks = [
  { icon: '🚚', title: 'Giao tận nơi', text: 'Đặt online, cửa hàng chuẩn bị và giao đến địa chỉ của bạn.' },
  { icon: '🏬', title: 'Nhận tại cửa hàng', text: 'Không muốn chờ ship? Đến cửa hàng lấy sách ngay khi đơn sẵn sàng.' },
  { icon: '💳', title: 'Thanh toán linh hoạt', text: 'Chuyển khoản, tiền mặt tại cửa hàng hoặc COD khi nhận hàng.' },
  { icon: '↩️', title: 'Hủy đơn dễ dàng', text: 'Đổi ý? Hủy ngay trong mục Đơn hàng khi đơn đang chờ xác nhận.' },
]

export const policies = [
  { title: 'Giao nhận', items: ['Chọn nhận tại cửa hàng hoặc giao tận nơi khi đặt hàng', 'Phí giao hàng (nếu có) hiển thị trong chi tiết đơn', 'Theo dõi trạng thái đơn trong mục Đơn hàng'] },
  { title: 'Thanh toán', items: ['Chuyển khoản ngân hàng', 'COD: thanh toán khi nhận hàng (chỉ đơn giao tận nơi)', 'Tiền mặt khi nhận tại cửa hàng'] },
  { title: 'Đổi hủy', items: ['Hủy đơn miễn phí khi đơn đang chờ xác nhận', 'Sau khi cửa hàng xác nhận, vui lòng liên hệ cửa hàng để được hỗ trợ', 'Sách hết hàng sẽ được báo ngay khi đặt'] },
]

export const faqs = [
  { q: 'Tôi cần gì để đặt mua sách?', a: 'Chỉ cần tạo tài khoản BookNook (tên đăng nhập, email, mật khẩu). Chọn sách, thêm vào giỏ rồi xác nhận đặt hàng.' },
  { q: 'Giá trên trang đã gồm thuế chưa?', a: 'Giá niêm yết là giá sách. Thuế VAT (nếu có) và phí giao hàng được cửa hàng tính khi tạo đơn, bạn xem tổng tiền cuối cùng trong mục Đơn hàng.' },
  { q: 'Tôi có thể hủy đơn không?', a: 'Có. Khi đơn ở trạng thái "Chờ xác nhận", bạn bấm "Hủy đơn" trong mục Đơn hàng. Sau khi cửa hàng đã xác nhận, hãy liên hệ cửa hàng.' },
  { q: 'Vì sao sách hiện "Hết hàng"?', a: 'Sách đó tạm hết trong kho. Bạn có thể xem các sách khác cùng tác giả hoặc quay lại sau.' },
  { q: 'Đặt hàng bị lỗi hoặc mất mạng giữa chừng thì sao?', a: 'Bạn cứ bấm đặt lại. Hệ thống nhận biết lần gửi lặp nên không tạo đơn trùng.' },
]

// Điều khoản mua hàng khách phải đồng ý trước khi đặt đơn (hiển thị ở trang thanh toán).
export const terms = [
  { title: '1. Thông tin đặt hàng', text: 'Bạn cam kết thông tin người nhận (họ tên, số điện thoại, địa chỉ) là chính xác. Cửa hàng dùng thông tin này để xác nhận và giao đơn.' },
  { title: '2. Giá và thanh toán', text: 'Giá hiển thị là giá sách. Thuế VAT (nếu có) và phí giao hàng do cửa hàng tính khi tạo đơn; tổng cuối cùng xem trong mục Đơn hàng. COD chỉ áp dụng cho đơn giao tận nơi, tiền mặt chỉ áp dụng khi nhận tại cửa hàng.' },
  { title: '3. Xác nhận đơn và tồn kho', text: 'Đơn chỉ có hiệu lực sau khi cửa hàng xác nhận. Nếu sách hết hàng hoặc ngừng bán, cửa hàng có thể từ chối đơn và sẽ thông báo cho bạn.' },
  { title: '4. Hủy đơn', text: 'Bạn tự hủy được khi đơn đang ở trạng thái "Chờ xác nhận". Sau khi đã xác nhận, vui lòng liên hệ cửa hàng để được hỗ trợ.' },
  { title: '5. Dữ liệu cá nhân', text: 'Thông tin của bạn chỉ dùng để xử lý đơn hàng và liên hệ về đơn hàng này, không chia sẻ cho bên thứ ba ngoài mục đích giao nhận.' },
]
