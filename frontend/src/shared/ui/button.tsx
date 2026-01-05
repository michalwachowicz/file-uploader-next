"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "error";

// Exported for testing purposes only
export const buttonVariantClasses = {
  primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
  error: "bg-error text-white hover:bg-error/90 focus:ring-error",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant style.
   * @default "primary"
   */
  variant?: ButtonVariant;
  /**
   * Button content.
   */
  children: ReactNode;
  /**
   * Optional additional CSS classes.
   */
  className?: string;
}

/**
 * Button component with variants and styling.
 */
export function Button({
  variant = "primary",
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "px-6 py-3 rounded-md font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(baseClasses, buttonVariantClasses[variant], className)}
    >
      {children}
    </button>
  );
}
