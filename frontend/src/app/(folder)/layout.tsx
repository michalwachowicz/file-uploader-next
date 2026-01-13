import { getCurrentUser } from "@/features/auth/lib";
import { redirect } from "next/navigation";
import { Routes } from "@/shared/lib/routes";

export default async function FolderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`${Routes.AUTH_CLEANUP}`);
  }

  return <>{children}</>;
}
