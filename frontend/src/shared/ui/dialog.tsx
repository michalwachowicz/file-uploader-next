"use client";

import clsx from "clsx";
import React, {
  useEffect,
  useRef,
  useId,
  ReactNode,
  HTMLAttributes,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/shared/assets/icons";

/**
 * Ref interface for Dialog component to programmatically control the dialog.
 */
export interface DialogRef {
  open: () => void;
}

interface DialogProps {
  /**
   * Dialog body content.
   */
  children: ReactNode;
  /**
   * Dialog title displayed in the header.
   */
  title: string;
  /**
   * Controlled open state.
   */
  open: boolean;
  /**
   * Callback when open state changes.
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Optional size variant.
   * @default "medium"
   */
  size?: "small" | "medium" | "large" | "fullscreen";
  /**
   * Optional additional CSS classes for the dialog content.
   */
  className?: string;
  /**
   * Optional ref to programmatically control the dialog.
   */
  ref?: React.Ref<DialogRef>;
}

/**
 * Dialog component that is always controlled from the outside.
 * Trigger has no events - dialogs are typically triggered from menu components.
 */
export function Dialog({
  children,
  title,
  open,
  onOpenChange,
  size = "large",
  className,
  ref,
}: DialogProps) {
  const baseId = useId();
  const dialogId = `dialog-${baseId}`;
  const titleId = `dialog-title-${baseId}`;

  useImperativeHandle(
    ref,
    () => {
      return {
        open: () => {
          onOpenChange(true);
        },
      };
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !contentRef.current) return;

    const content = contentRef.current;
    const focusableElements = content.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
    };
  }, [open]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (backdropRef.current && backdropRef.current === e.target) {
      onOpenChange(false);
    }
  };

  const sizeClasses = {
    small: "max-w-sm",
    medium: "max-w-md",
    large: "max-w-lg",
    fullscreen: "max-w-full h-full m-0 rounded-none",
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200'
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
      id={dialogId}
    >
      <div
        ref={contentRef}
        className={clsx(
          "relative w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl",
          "transition-all duration-200 transform",
          "focus:outline-none",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader
          title={title}
          onClose={() => onOpenChange(false)}
          titleId={titleId}
        />
        <div className='p-6'>{children}</div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Internal DialogHeader component - dialog header with title and close button.
 */
function DialogHeader({
  title,
  onClose,
  titleId,
}: {
  title: string;
  onClose: () => void;
  titleId: string;
}) {
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className='flex items-center justify-between px-6 py-4 border-b border-slate-700'>
      <h2 id={titleId} className='text-xl font-semibold text-slate-100'>
        {title}
      </h2>
      <button type='button' onClick={handleClose} aria-label='Close dialog'>
        <CloseIcon className='size-6.5 text-slate-400' />
      </button>
    </div>
  );
}

/**
 * DialogActions component props.
 */
export interface DialogActionsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Action buttons content.
   */
  children: ReactNode;
  /**
   * Optional additional CSS classes.
   */
  className?: string;
}

/**
 * DialogActions component - container for action buttons.
 */
export function DialogActions({
  children,
  className,
  ...props
}: DialogActionsProps) {
  return (
    <div
      className={clsx("flex items-center justify-end gap-3 mt-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
