import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types/inventory';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const bg =
          t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-rose-600' : 'bg-slate-800';
        const icon =
          t.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : t.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          );

        return (
          <div
            key={t.id}
            className={`${bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs font-medium pointer-events-auto transition-all animate-bounce-in`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-white/80 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
