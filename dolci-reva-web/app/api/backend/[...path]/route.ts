import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  laravelApiBase,
} from "@/lib/auth-session";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "cookie",
  "content-length",
]);

async function proxy(
  request: NextRequest,
  pathSegments: string[]
): Promise<NextResponse> {
  const base = laravelApiBase();
  const path = pathSegments.map(encodeURIComponent).join("/");
  const search = request.nextUrl.search;
  const upstreamUrl = `${base}${path}${search}`;

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set("Accept", headers.get("Accept") || "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.delete("Authorization");
  }

  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers,
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // Laisser le boundary tel quel depuis le body brut
      init.body = await request.arrayBuffer();
      // Content-Type d'origine (avec boundary) déjà copié
    } else if (contentType.includes("application/json")) {
      init.body = await request.text();
    } else {
      init.body = await request.arrayBuffer();
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, init);
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: "API upstream injoignable.",
        error: e instanceof Error ? e.message : "fetch failed",
      },
      { status: 502 }
    );
  }

  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "transfer-encoding" || k === "connection") return;
    // Réécrire Location absolues Laravel → proxy si besoin : laisser tel quel
    outHeaders.set(key, value);
  });

  // Si Laravel déconnecte, nettoyer le cookie session
  if (upstream.status === 401) {
    const res = new NextResponse(upstream.body, {
      status: 401,
      headers: outHeaders,
    });
    res.cookies.set(ACCESS_TOKEN_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
