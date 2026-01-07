"use client";

import { useState } from "react";
import { Input, InputProps } from "@/shared/ui/input";
import {
  VisibilityIcon,
  VisibilityOffIcon,
} from "@/features/auth/assets/icons";

export function PasswordField({ ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='relative'>
      <Input {...props} type={showPassword ? "text" : "password"} />

      <button
        className='absolute bottom-3 right-3 text-slate-500 cursor-pointer'
        type='button'
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <VisibilityOffIcon className='size-5' />
        ) : (
          <VisibilityIcon className='size-5' />
        )}
      </button>
    </div>
  );
}
