"use client";

import clsx from "clsx";
import { InputHTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * React Hook Form field error for the input field.
   */
  error?: FieldError | string;
  /**
   * Optional label for the input field.
   */
  label?: string;
  /**
   * Optional helper text displayed below the input.
   */
  helperText?: string;
}

/**
 * Input component with label, error display, and styling.
 * Works with react-hook-form by spreading register props: <Input {...register("field")} />
 */
export function Input({
  id,
  name,
  label,
  error,
  className,
  ...props
}: InputProps) {
  const errorMessage = typeof error === "string" ? error : error?.message;
  const hasError = !!errorMessage;

  return (
    <div className='flex flex-col gap-1 w-full'>
      {label && (
        <label
          htmlFor={name}
          className={clsx("text-sm font-medium", {
            "text-error": hasError,
          })}
        >
          {label}
        </label>
      )}

      <input
        {...props}
        name={name}
        id={id}
        className={clsx(
          "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 text-lg",
          {
            "border-slate-500 focus:ring-primary focus:border-primary":
              !hasError,
            "border-error focus:border-error focus:ring-error": hasError,
            className,
          }
        )}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />

      {hasError && (
        <div
          id={`${id}-error`}
          role='alert'
          className='text-sm text-error mt-1'
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}
