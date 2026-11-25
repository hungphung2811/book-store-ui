import RequiredMark from './RequiredMark'

export default function Select({ label, options, id, className = '', ...props }) {
  const selectId = id || props.name
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label htmlFor={selectId} className="text-sm font-bold">{label}{props.required && <RequiredMark />}</label>}
      <select
        id={selectId}
        className="w-full rounded-brutal border-2 border-ink bg-white px-3 py-2 shadow-brutal-sm outline-none focus:bg-brand/20"
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
