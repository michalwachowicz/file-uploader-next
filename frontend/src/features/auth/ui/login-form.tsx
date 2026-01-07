"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@file-uploader/shared";
import { login } from "@/features/auth/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Routes } from "@/shared/lib/routes";
import { Button, Input } from "@/shared/ui";
import { PasswordField } from "@/features/auth/ui";

/**
 * Login form component.
 */
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);
      setIsSubmitting(true);

      await login(data);

      router.push(Routes.HOME);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";

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
        {...register("username")}
        error={errors.username}
      />

      <PasswordField
        label='Password'
        id='password'
        {...register("password")}
        error={errors.password}
      />

      {error && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-sm text-red-800'>{error}</p>
        </div>
      )}

      <div className='flex flex-col gap-3'>
        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>

        <p className='text-center'>
          Don&apos;t have an account?{" "}
          <Link
            href={Routes.AUTH_REGISTER}
            className='text-primary-light hover:text-primary-light/90 font-bold'
          >
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
}
