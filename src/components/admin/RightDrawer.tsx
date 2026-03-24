'use client';

import { useEffect } from 'react';

type RightDrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function RightDrawer({ open, title, onClose, children }: RightDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/35 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl transform border-l border-[#E4E9FF] bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#E4E9FF] px-5 py-4">
          <h3 className="text-lg font-bold text-[#232B4A]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#D7DEF7] px-2 py-1 text-sm font-semibold text-[#4E5778]"
            aria-label="Close drawer"
          >
            X
          </button>
        </div>
        <div className="h-[calc(100%-65px)] overflow-y-auto p-5">{children}</div>
      </aside>
    </>
  );
}
