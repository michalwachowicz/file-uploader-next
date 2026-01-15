import { getCurrentUser } from "@/features/auth/lib";
import { redirect } from "next/navigation";
import { Routes } from "@/shared/lib/routes";
import { Header } from "@/widgets/header/ui";
import { getFolderTree } from "@/features/folder/lib";
import { UserCreator } from "@/features/auth/ui";
import { LayoutWrapper } from "@/widgets/layout/ui";

export default async function FolderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`${Routes.AUTH_CLEANUP}`);
  }

  const folderTreeData = await getFolderTree();
  const folders = folderTreeData?.folders || [];

  return (
    <UserCreator user={user}>
      <LayoutWrapper folders={folders} navigation={<Header user={user} />}>
        {children}
      </LayoutWrapper>
    </UserCreator>
  );
}
