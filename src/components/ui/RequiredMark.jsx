// Dấu * đỏ cạnh nhãn của ô bắt buộc. aria-hidden vì trình đọc màn hình đã biết ô `required`.
export default function RequiredMark() {
  return <span className="ml-0.5 font-bold text-red-600" aria-hidden="true">*</span>
}
