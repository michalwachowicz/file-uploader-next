"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@file-uploader/shared";
import { register } from "@/features/auth/api";
import { useRouter } from "next/navigation";
import { Routes } from "@/shared/lib/routes";
import { PasswordField, PasswordRequirements } from "@/features/auth/ui";
import { Button, Input } from "@/shared/ui";

/**
 * Register form component with password strength indicator.
 */
export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput & { confirmPassword: string }>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const onSubmit = async (
    data: RegisterInput & { confirmPassword: string }
  ) => {
    try {
      setError(null);
      setIsSubmitting(true);

      await register({
        username: data.username,
        password: data.password,
      });

      router.push(Routes.AUTH_LOGIN);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex flex-col gap-5 w-full max-w-md mx-auto'
    >
      <Input
        label='Username'
        id='username'
        type='text'
        {...registerField("username")}
        error={errors.username}
      />

      <div className='relative'>
        <PasswordField
          label='Password'
          id='password'
          {...registerField("password")}
        />

        <div className='2xl:absolute 2xl:top-0 2xl:left-[calc(100%+1rem)] w-full'>
          <PasswordRequirements password={password} />
        </div>
      </div>

      <PasswordField
        label='Confirm Password'
        id='confirmPassword'
        {...registerField("confirmPassword")}
        error={errors.confirmPassword}
      />

      {error && (
        <div className='p-3 bg-red-200 border border-red-400 rounded-md'>
          <p className='text-sm text-red-800'>{error}</p>
        </div>
      )}

      <div className='flex flex-col gap-3'>
        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>

        <p className='text-center'>
          Already have an account?{" "}
          <Link
            href={Routes.AUTH_LOGIN}
            className='text-primary-light hover:text-primary-light/90 font-bold'
          >
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
}
