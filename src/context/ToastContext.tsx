import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  title?: string;
  message: string;
}

interface ToastApi {
  show: (kind: ToastKind, message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  error:   (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info:    (message: string, title?: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | undefined>(undefined);

const DEFAULT_DURATIONS: Record<ToastKind, number> = {
  success: 3500,
  info:    3500,
  warning: 5000,
  error:   6000,
};

const ICONS: Record<ToastKind, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seqRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((kind: ToastKind, message: string, title?: string) => {
    const id = ++seqRef.current;
    setItems((prev) => [...prev, { id, kind, title, message }]);
    setTimeout(() => dismiss(id), DEFAULT_DURATIONS[kind]);
  }, [dismiss]);

  const api: ToastApi = {
    show,
    success: (m, t) => show('success', m, t),
    error:   (m, t) => show('error',   m, t),
    warning: (m, t) => show('warning', m, t),
    info:    (m, t) => show('info',    m, t),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" role="region" aria-live="polite" aria-label="Notifications">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
            <span className="toast-icon" aria-hidden>{ICONS[t.kind]}</span>
            <div className="toast-body">
              {t.title && <div className="toast-title">{t.title}</div>}
              <div className="toast-msg">{t.message}</div>
            </div>
            <button
              type="button"
              className="toast-close"
              aria-label="Đóng thông báo"
              onClick={() => dismiss(t.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
