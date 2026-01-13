"use server";

import { cookies } from "next/headers";

export async function removeUserToken() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}
