import { removeUserToken } from "@/features/auth/lib";
import { Routes } from "@/shared/lib/routes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await removeUserToken();
  return NextResponse.redirect(new URL(Routes.AUTH_LOGIN, request.url));
}
