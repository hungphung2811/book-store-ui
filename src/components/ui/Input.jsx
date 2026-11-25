import RequiredMark from './RequiredMark'

export default function Input({ label, error, id, className = '', ...props }) {
  const inputId = id || props.name
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label htmlFor={inputId} className="text-sm font-bold">{label}{props.required && <RequiredMark />}</label>}
      <input
        id={inputId}
        className={`w-full rounded-brutal border-2 bg-white px-3 py-2 shadow-brutal-sm outline-none focus:bg-brand/20 focus:shadow-brutal ${error ? 'border-red-600' : 'border-ink'}`}
        {...props}
      />
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  )
}
