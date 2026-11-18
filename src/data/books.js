export const categories = ['Văn học', 'Kinh tế', 'Kỹ năng', 'Thiếu nhi', 'Khoa học', 'Lịch sử']

const descriptions = [
  'Hành trình của chú dế mèn từ cái hang nhỏ ra thế giới rộng lớn, đầy bạn bè và bài học về lòng dũng cảm.',
  'Câu chuyện về cậu bé chăn cừu đi tìm kho báu và học cách lắng nghe trái tim mình.',
  'Những nguyên tắc ứng xử kinh điển giúp bạn kết bạn, thuyết phục và tạo ảnh hưởng với người khác.',
  'Lược sử loài người, từ thời săn bắt hái lượm đến kỷ nguyên công nghệ, dưới góc nhìn đầy bất ngờ.',
  'Hai người cha, hai cách nghĩ về tiền bạc, và bài học tài chính cá nhân mà trường lớp ít khi dạy.',
  'Tuổi thơ miền quê với những rung động đầu đời, nhẹ nhàng và đầy hoài niệm.',
  'Từ Vụ Nổ Lớn đến hố đen, giải thích những bí ẩn của vũ trụ bằng ngôn ngữ dễ hiểu.',
  'Chuyện về hoàng tử nhỏ đến từ tinh cầu xa xôi, một lời nhắc dịu dàng về điều thực sự quan trọng.',
  'Hai hệ thống tư duy chi phối quyết định của chúng ta và cách nhận ra những cái bẫy trong đầu.',
  'Vì sao các nền văn minh phát triển không đều nhau? Một cái nhìn rộng về địa lý, vi trùng và công nghệ.',
  'Tiểu thuyết trào phúng sắc sảo về xã hội thành thị đầu thế kỷ XX, đọc là bật cười rồi ngẫm.',
  'Những nguyên lý về tư duy và kỷ luật của hàng trăm người thành đạt, được đúc kết thành các bước cụ thể.',
  'Hawking dẫn dắt người đọc qua thuyết tương đối, cơ học lượng tử và những câu hỏi lớn của vật lý.',
  'Hai mạch truyện đan xen giữa thực và mơ, về một cậu bé bỏ nhà đi và những điều kỳ lạ trên đường.',
  'Cách những thay đổi nhỏ mỗi ngày cộng dồn thành kết quả lớn, kèm khung xây dựng và bỏ thói quen.',
  'Tóm lược dòng chảy lịch sử dân tộc từ buổi đầu dựng nước, ngắn gọn và dễ theo dõi.',
  'Câu chuyện về di truyền học, từ Mendel đến chỉnh sửa gen, đan xen với lịch sử một gia đình.',
  'Gia tộc mafia Corleone và cái giá của quyền lực, danh dự và lòng trung thành.',
  'Vì sao một số công ty vượt lên hẳn những đối thủ cùng ngành? Kết quả từ nghiên cứu nhiều năm.',
  'Cô bé nghịch ngợm và ngôi trường có toa tàu làm lớp học, nơi mỗi đứa trẻ được tôn trọng.',
]

const raw = [
  ['Dế Mèn phiêu lưu ký', 'Tô Hoài', 'Thiếu nhi', 3000, true],
  ['Nhà giả kim', 'Paulo Coelho', 'Văn học', 5000, true],
  ['Đắc nhân tâm', 'Dale Carnegie', 'Kỹ năng', 4000, true],
  ['Sapiens: Lược sử loài người', 'Yuval Noah Harari', 'Lịch sử', 6000, true],
  ['Cha giàu cha nghèo', 'Robert Kiyosaki', 'Kinh tế', 4000, true],
  ['Tôi thấy hoa vàng trên cỏ xanh', 'Nguyễn Nhật Ánh', 'Văn học', 4000, false],
  ['Lược sử thời gian', 'Stephen Hawking', 'Khoa học', 5000, false],
  ['Hoàng tử bé', 'Antoine de Saint-Exupéry', 'Thiếu nhi', 3000, false],
  ['Tư duy nhanh và chậm', 'Daniel Kahneman', 'Kỹ năng', 6000, false],
  ['Súng, vi trùng và thép', 'Jared Diamond', 'Lịch sử', 6000, false],
  ['Số đỏ', 'Vũ Trọng Phụng', 'Văn học', 3000, false],
  ['Nghĩ giàu làm giàu', 'Napoleon Hill', 'Kinh tế', 4000, false],
  ['Vũ trụ trong vỏ hạt dẻ', 'Stephen Hawking', 'Khoa học', 5000, false],
  ['Kafka bên bờ biển', 'Haruki Murakami', 'Văn học', 5000, false],
  ['Atomic Habits – Thay đổi tí hon, hiệu quả bất ngờ và những phương pháp xây dựng thói quen tốt trong cuộc sống hằng ngày của bạn', 'James Clear', 'Kỹ năng', 5000, false],
  ['Việt Nam sử lược', 'Trần Trọng Kim', 'Lịch sử', 4000, false],
  ['Gen: Lịch sử và tương lai', 'Siddhartha Mukherjee', 'Khoa học', 6000, false],
  ['Bố già', 'Mario Puzo', 'Văn học', 5000, false],
  ['Từ tốt đến vĩ đại', 'Jim Collins', 'Kinh tế', 5000, false],
  ['Totto-chan bên cửa sổ', 'Tetsuko Kuroyanagi', 'Thiếu nhi', 3000, false],
]

// ISBN (bản tiếng Anh) để lấy ảnh bìa từ Open Library; null = dùng bìa màu mặc định
const isbns = [
  null, '9780062315007', '9780671027032', '9780062316097', '9781612680194',
  null, '9780553380163', '9780156012195', '9780374533557', '9780393317558',
  '9780472030224', '9781585424337', '9780553802023', '9781400079278', '9780735211292',
  null, '9781476733524', '9780451205766', '9780066620992', '9784770020475',
]

export const books = raw.map(([title, author, category, pricePerDay, featured], i) => ({
  id: String(i + 1),
  title,
  author,
  category,
  description: descriptions[i],
  pricePerDay,
  featured,
  cover: isbns[i] ? `https://covers.openlibrary.org/b/isbn/${isbns[i]}-L.jpg?default=false` : null,
  rating: Number((4 + ((i * 3) % 10) / 10).toFixed(1)),
  rentCount: 12 + ((i * 37) % 90),
  addedDaysAgo: (i * 7) % 60,
  pages: 180 + ((i * 53) % 320),
  publisher: ['NXB Trẻ', 'NXB Kim Đồng', 'NXB Tổng hợp', 'NXB Thế Giới', 'Alpha Books'][i % 5],
  year: 2008 + ((i * 5) % 17),
  condition: i % 4 === 0 ? 'Như mới' : 'Tốt',
}))

export const hotBooks = [...books].sort((a, b) => b.rentCount - a.rentCount)
export const newBooks = [...books].sort((a, b) => a.addedDaysAgo - b.addedDaysAgo)

export const priceRanges = [
  { value: 'all', label: 'Tất cả mức giá', test: () => true },
  { value: 'lt4', label: 'Dưới 4.000đ/ngày', test: (p) => p < 4000 },
  { value: '4to5', label: '4.000đ – 5.000đ', test: (p) => p >= 4000 && p <= 5000 },
  { value: 'gt5', label: 'Trên 5.000đ', test: (p) => p > 5000 },
]

export const sortOptions = [
  { value: 'default', label: 'Mặc định' },
  { value: 'hot', label: 'Thuê nhiều nhất' },
  { value: 'new', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
]

export const durations = [3, 7, 14]

export const formatVnd = (n) => `${n.toLocaleString('vi-VN')}đ`
