"use client";

import clsx from "clsx";
import { useId, useMemo } from "react";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
}

/**
 * Password requirements component that displays validation status.
 */
export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const headingId = useId();
  const requirements = useMemo<PasswordRequirement[]>(() => {
    return [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "At least one lowercase letter",
        met: /[a-z]/.test(password),
      },
      {
        label: "At least one uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "At least one number",
        met: /[0-9]/.test(password),
      },
      {
        label: "At least one special character",
        met: /[^a-zA-Z0-9]/.test(password),
      },
    ];
  }, [password]);

  if (requirements.every((req) => req.met)) {
    return null;
  }

  return (
    <div
      className='mt-4 space-y-1 p-6 bg-slate-900 rounded-lg flex flex-col gap-3'
      role='region'
      aria-label='Password requirements'
      aria-live='polite'
      aria-atomic='false'
    >
      <p className='text-sm font-medium' id={headingId}>
        Password requirements:
      </p>
      <ul className='flex flex-col gap-2' aria-labelledby={headingId}>
        {requirements.map((req, index) => (
          <li
            key={index}
            className='flex items-center gap-2 text-sm'
            role='listitem'
            aria-label={`${req.label}: requirement ${
              req.met ? "met" : "not met"
            }`}
          >
            <div
              className={clsx(
                "flex w-4 h-4 rounded-full items-center justify-center",
                {
                  "bg-green-600 text-foreground": req.met,
                  "bg-slate-600": !req.met,
                }
              )}
              aria-hidden='true'
            >
              {req.met ? "✓" : ""}
            </div>
            <span
              className={clsx("text-sm", {
                "text-green-600": req.met,
                "text-slate-400": !req.met,
              })}
            >
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
