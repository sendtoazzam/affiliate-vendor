'use client';

import React, { useEffect } from 'react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning' | 'info';
  icon?: 'logout' | 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  icon = 'logout',
  loading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          btn: 'btn-error text-white shadow-error/20',
          badge: 'bg-error/10 text-error',
          ring: 'bg-error/10',
        };
      case 'warning':
        return {
          btn: 'btn-warning text-warning-content shadow-warning/20',
          badge: 'bg-warning/10 text-warning',
          ring: 'bg-warning/10',
        };
      case 'info':
        return {
          btn: 'btn-info text-white shadow-info/20',
          badge: 'bg-info/10 text-info',
          ring: 'bg-info/10',
        };
      case 'primary':
      default:
        return {
          btn: 'btn-primary text-white shadow-primary/20',
          badge: 'bg-primary/10 text-primary',
          ring: 'bg-primary/10',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          {/* Animated SVG Icon */}
          <div className="relative shrink-0 flex items-center justify-center">
            <span
              className={`absolute inset-0 rounded-2xl ${variantStyles.ring} animate-pulse-glow`}
            />
            <div
              className={`w-14 h-14 rounded-2xl ${variantStyles.badge} flex items-center justify-center relative z-10`}
            >
              {icon === 'logout' && (
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <g className="animate-slide-arrow">
                    <polyline
                      points="16 17 21 12 16 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="21"
                      y1="12"
                      x2="9"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
              )}

              {icon === 'danger' && (
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}

              {icon === 'warning' && (
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}

              {icon === 'info' && (
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-base-content tracking-tight mb-1">
              {title}
            </h3>
            <p className="text-xs text-base-content/70 leading-relaxed mb-6">
              {description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn btn-sm btn-ghost text-xs font-semibold px-4"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`btn btn-sm ${variantStyles.btn} text-xs font-semibold px-4 shadow-sm`}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
