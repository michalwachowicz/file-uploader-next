import { LoginForm } from "@/features/auth/ui";

export default function LoginPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-6 px-4 py-8'>
      <h1 className='text-2xl font-bold'>Login</h1>
      <LoginForm />
    </div>
  );
}
