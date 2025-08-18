import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Accessible Modal primitive.
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - title?: string
 * - children
 */

export default function Modal(props: any) {
  const { isOpen, onClose, title, children, size = 'md' } = props;
  const elRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      elRef.current = document.getElementById('modal-root') || document.body;
    }
  }, []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose && onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      // lock scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [isOpen, onClose]);

  // simple focus management: focus first focusable element inside modal when opened
  React.useEffect(() => {
    if (!isOpen) return;
    const node = contentRef.current;
    if (!node) return;
    const focusable = node.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        className={`relative z-10 w-full max-w-${size} mx-4`}
      >
        <div ref={contentRef} className="bg-neutral-950 text-neutral-100 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="font-medium">{title}</div>
            <button aria-label="Close" className="text-neutral-400 hover:text-neutral-200" onClick={() => onClose && onClose()}>
              ✕
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );

  return elRef.current ? ReactDOM.createPortal(content, elRef.current) : null;
}
