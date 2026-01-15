"use client";

import { useUserActions } from "@/features/auth/lib";
import { UserResponse } from "@file-uploader/shared";
import { useEffect } from "react";

export function UserCreator({
  user,
  children,
}: {
  user: UserResponse | null;
  children: React.ReactNode;
}) {
  const { setUser } = useUserActions();

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  return <>{children}</>;
}
