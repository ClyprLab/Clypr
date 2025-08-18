import React from 'react';
import ReactDOM from 'react-dom';

export default function SlideOver(props: any) {
  const { isOpen, onClose, title, children, side = 'right', width = 'w-[520px]' } = props;
  const elRef = React.useRef<HTMLElement | null>(null);

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
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose && onClose()} />
      <div className={`relative z-10 ${side === 'right' ? 'ml-auto' : 'mr-auto'} ${width} h-full bg-neutral-950 text-neutral-100 shadow-xl`}> 
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="font-medium">{title}</div>
          <button aria-label="Close" onClick={() => onClose && onClose()} className="text-neutral-400">✕</button>
        </div>
        <div className="p-4 overflow-auto h-full">{children}</div>
      </div>
    </div>
  );

  return elRef.current ? ReactDOM.createPortal(content, elRef.current) : null;
}
