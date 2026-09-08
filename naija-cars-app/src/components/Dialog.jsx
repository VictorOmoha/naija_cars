import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

// Native modals provide keyboard trapping, an inert background, and focus return.
export default function Dialog({ open, onClose, title, children, className = '' }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!open) { element.close(); return; }
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = previousOverflow; if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
  }, [open]);
  return (
    <dialog ref={dialog} aria-labelledby={titleId} className={`nc-dialog ${className}`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
      <div className="nc-dialog-surface">
        <div className="nc-dialog-header"><h2 id={titleId}>{title}</h2><button className="nc-icon-button" onClick={onClose} aria-label={`Close ${title.toLowerCase()}`}><X size={22} /></button></div>
        {children}
      </div>
    </dialog>
  );
}
