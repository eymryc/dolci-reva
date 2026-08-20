import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  accessCookieOptions,
  laravelApiBase,
} from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    try {
      await fetch(`${laravelApiBase()}auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // On efface le cookie même si Laravel est injoignable
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...accessCookieOptions(0),
    maxAge: 0,
  });

  return response;
}
