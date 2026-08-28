'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertNotificationProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
}) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-600 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border transition-all animate-in fade-in slide-in-from-top-2 duration-200',
        bgStyles[type],
        className
      )}
      role="alert"
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1 text-sm">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <p className="opacity-90 leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="p-1 -mr-1 -mt-1 opacity-70 hover:opacity-100 transition-opacity rounded-lg hover:bg-black/5"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
