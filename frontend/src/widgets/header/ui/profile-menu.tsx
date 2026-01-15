"use client";

import { removeUserToken, useUserActions } from "@/features/auth/lib";
import { Routes } from "@/shared/lib/routes";
import { Menu, MenuItem, MenuList, MenuTrigger } from "@/shared/ui";
import { UserResponse } from "@file-uploader/shared";
import { useRouter } from "next/navigation";
import { AccountIcon } from "@/widgets/header/assets/icons";
import { ArrowDropdownIcon } from "@/shared/assets/icons";

export function ProfileMenu({ user }: { user: UserResponse }) {
  const router = useRouter();
  const { clearUser } = useUserActions();

  const handleLogout = async () => {
    await removeUserToken();
    clearUser();
    router.push(Routes.AUTH_LOGIN);
  };

  return (
    <Menu>
      <MenuTrigger className='flex items-center gap-1 sm:gap-2.5 text-slate-400'>
        <AccountIcon className='size-8' />
        <div className='flex items-center gap-1'>
          <span className='hidden sm:inline text-lg font-bold'>
            {user.username}
          </span>
          <ArrowDropdownIcon className='size-5' />
        </div>
      </MenuTrigger>
      <MenuList>
        <MenuItem onSelect={() => router.push(Routes.SETTINGS)}>
          Settings
        </MenuItem>
        <MenuItem onSelect={handleLogout} className='text-red-500'>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
