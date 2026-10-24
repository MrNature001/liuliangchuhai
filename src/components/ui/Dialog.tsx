'use client';

/**
 * 无障碍对话框
 * Accessible dialog
 *
 * 用原生 <dialog> 元素而不是自己造遮罩：焦点陷阱、Esc 关闭、
 * inert 背景由浏览器实现，比手写更可靠，也更容易满足 WCAG。
 */

import { useEffect, useId, useRef, type ReactNode } from 'react';

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const generatedId = useId();
  const titleId = labelledBy ?? `${generatedId}-title`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', handleCancel);
    return () => el.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="rounded-xl p-0 w-[min(92vw,44rem)] max-h-[88vh] backdrop:bg-black/60 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      onClick={(e) => {
        // 点击 dialog 自身（即遮罩区域）时关闭
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="flex flex-col max-h-[88vh]">
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id={titleId} className="text-xl font-bold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zhuang-red"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5 overflow-y-auto">{children}</div>
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-end">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

/** 轻量提示条：用于保存成功等非阻塞反馈（替代 alert） */
export function Toast({ message, onDone, tone = 'ok' }: { message: string; onDone: () => void; tone?: 'ok' | 'warn' }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(timer);
  }, [onDone, message]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[1400] px-5 py-3 rounded-full shadow-lg text-sm font-medium text-white ${
        tone === 'ok' ? 'bg-gray-900 dark:bg-gray-100 dark:text-gray-900' : 'bg-amber-700'
      }`}
    >
      {message}
    </div>
  );
}
