'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

type Size = number | string;

type ModernSelectProps = {
  label?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;

  /** width of button, or isFull */
  width?: Size;
  isFull?: boolean;
  height?: Size;
  dropdownMaxHeight?: Size;
};

export const ModernSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Выберите значение',

  width,
  isFull = false,
  height = 56,
  dropdownMaxHeight = 260,
}: ModernSelectProps) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const toggle = () => {
    if (!btnRef.current) return;
    setRect(btnRef.current.getBoundingClientRect());
    setOpen((v) => !v);
  };

  const normalizeSize = (v?: Size) => (typeof v === 'number' ? `${v}px` : v);

  const buttonWidth = isFull ? '100%' : (normalizeSize(width) ?? 'auto');

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-nekstmedium text-gray-700/90 pl-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={cn(
          'px-4 rounded-xl border bg-white text-left flex items-center justify-between shadow-sm transition',
          open
            ? 'border-emerald-400 ring-2 ring-emerald-400/30'
            : 'border-gray-300 hover:border-gray-400',
        )}
        style={{
          width: buttonWidth,
          height: normalizeSize(height),
        }}
      >
        <span
          className={cn(
            'truncate font-nekstregular',
            value ? 'text-gray-800' : 'text-gray-400',
          )}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            'transition-transform text-gray-500',
            open && 'rotate-180 text-emerald-500',
          )}
        />
      </button>

      {/* Dropdown */}
      {mounted &&
        rect &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.ul
                ref={dropdownRef}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="fixed z-[9999] overflow-auto rounded-xl bg-white border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                style={{
                  top: rect.bottom + 8,
                  left: rect.left,
                  width: rect.width, // ширина точно как у кнопки
                  maxHeight: normalizeSize(dropdownMaxHeight),
                }}
              >
                {options.map((opt) => (
                  <li
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={cn(
                      'px-4 py-2.5 cursor-pointer flex items-center justify-between text-sm font-nekstregular transition',
                      value === opt
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'hover:bg-gray-50 text-gray-700',
                    )}
                  >
                    <span className="truncate">{opt}</span>
                    {value === opt && (
                      <Check size={16} className="text-emerald-500 shrink-0" />
                    )}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
