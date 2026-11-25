import { useEffect, useId, useRef } from 'react'

export default function Dialog({ open, onClose, title, children }) {
  const panelRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-brutal border-2 border-ink bg-white p-6 shadow-brutal outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 id={titleId} className="mb-4 break-words text-xl">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
