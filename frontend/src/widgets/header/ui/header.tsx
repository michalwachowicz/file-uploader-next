import Link from "next/link";
import { Routes } from "@/shared/lib/routes";
import { UserResponse } from "@file-uploader/shared";
import { ProfileMenu } from "@/widgets/header/ui/profile-menu";

export function Header({ user }: { user: UserResponse }) {
  return (
    <header className='flex items-center justify-between gap-8'>
      <Link href={Routes.HOME}>
        <h1 className='text-2xl font-bold text-primary-light'>File Uploader</h1>
      </Link>

      <ProfileMenu user={user} />
    </header>
  );
}
