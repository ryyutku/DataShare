import React, { useEffect, useRef } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  titleGraphic?: React.ReactNode;
  banner?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ariaLabel?: string;
  maxWidth?: string; // e.g. 'max-w-md'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onBack,
  title,
  subtitle,
  titleGraphic,
  banner,
  children,
  footer,
  ariaLabel = "Dialog",
  maxWidth = "max-w-md",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key & lock background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="region"
      aria-live="polite"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Shell */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`relative w-full ${maxWidth} bg-[#1A1A1B] text-[#D7DADC] border border-[#343536] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 font-sans`}
      >
        {/* Top Bar: Back Button, Graphic, Close Button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="inline-flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="p-1.5 text-[#818384] hover:text-[#D7DADC] hover:bg-[#272729] rounded-full transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            {titleGraphic}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-[#818384] hover:text-[#D7DADC] hover:bg-[#272729] rounded-full transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Optional Alert/Notice Banner */}
        {banner && <div className="px-6 py-2">{banner}</div>}

        {/* Content Container */}
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-2">
          {title && (
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-[#818384] mb-5 leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Main Slot/Body */}
          <div className="flex-1">{children}</div>
        </div>

        {/* Footer */}
        {footer && <div className="px-6 py-4 bg-[#1A1A1B]">{footer}</div>}
      </div>
    </div>
  );
};