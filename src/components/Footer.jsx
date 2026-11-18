export default function Footer({ flush = false }) {
  return (
    <footer className={`${flush ? '' : 'mt-16'} border-t-2 border-ink bg-brand`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm font-medium sm:flex-row sm:justify-between">
        <span className="font-bold">BOOKNOOK – Thuê sách, đọc thả ga</span>
        <span>© 2026 BookNook. Giao diện demo.</span>
      </div>
    </footer>
  )
}
