import { LoginForm } from "@/features/auth/ui";

export default function LoginPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen gap-6'>
      <h1 className='text-2xl font-bold'>Login</h1>
      <LoginForm />
    </div>
  );
}
