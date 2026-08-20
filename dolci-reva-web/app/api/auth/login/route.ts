import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  accessCookieOptions,
  laravelApiBase,
} from "@/lib/auth-session";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  let body: LoginBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Corps JSON invalide." },
      { status: 400 }
    );
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { success: false, message: "Email et mot de passe requis." },
      { status: 422 }
    );
  }

  const upstream = await fetch(`${laravelApiBase()}auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
    }),
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const token = typeof data.token === "string" ? data.token : null;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Réponse login sans token." },
      { status: 502 }
    );
  }

  // Ne jamais renvoyer le token au navigateur
  const safe = { ...data };
  delete safe.token;
  delete safe.type;

  const response = NextResponse.json(
    {
      ...safe,
      success: true,
    },
    { status: 200 }
  );

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    token,
    accessCookieOptions(ACCESS_TOKEN_MAX_AGE)
  );

  return response;
}
