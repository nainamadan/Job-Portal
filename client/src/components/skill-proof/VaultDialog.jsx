import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

export default function VaultDialog({ title, children, onClose, busy = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog ref={ref} className="spv-dialog" aria-labelledby="spv-dialog-title"
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <div className="spv-dialog-inner">
        <header className="spv-dialog-heading"><h2 id="spv-dialog-title">{title}</h2><button type="button" className="spv-icon-button" onClick={onClose} disabled={busy} aria-label="Close dialog"><FiX /></button></header>
        {children}
      </div>
    </dialog>
  );
}
