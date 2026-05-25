/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  
  // Close on Escape keypress
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-lg border border-stone-200 p-6 flex flex-col space-y-4 animate-scale-up">
        
        {/* Header decoration */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-700 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 animate-bounce-slow" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-stone-900 font-display">
              {title}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {message}
            </p>
          </div>
          <button 
            type="button"
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-700 ml-auto p-1 rounded-md hover:bg-stone-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Buttons tray */}
        <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] font-semibold tracking-wide px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-[11px] font-semibold tracking-wide px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg cursor-pointer transition-colors shadow-xs"
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
