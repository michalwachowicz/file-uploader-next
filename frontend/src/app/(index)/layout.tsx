import { getCurrentUser } from "@/features/auth/lib";
import { redirect } from "next/navigation";
import { Routes } from "@/shared/lib/routes";
import { Header } from "@/widgets/header/ui";

export default async function FolderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`${Routes.AUTH_CLEANUP}`);
  }

  return (
    <>
      <Header user={user} />
      <main className='p-6'>{children}</main>
    </>
  );
}
