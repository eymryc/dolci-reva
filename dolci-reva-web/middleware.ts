import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OWNER_SPACE_COOKIE, swapBackofficeBase } from "@/lib/host-paths";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-session";

/**
 * Origin public derrière Nginx (évite https://localhost:3001 en redirect).
 */
function publicOrigin(request: NextRequest): string {
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    request.nextUrl.protocol.replace(":", "") ||
    "https";
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host")?.split(",")[0]?.trim() ||
    request.nextUrl.host;

  // Refuse les hosts internes (bind PM2) même si un header manque
  if (
    !host ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("localhost")
  ) {
    return "https://dolci-reva.com";
  }

  return `${proto}://${host}`;
}

function redirectPublic(request: NextRequest, pathname: string, searchParams?: Record<string, string>) {
  const url = new URL(pathname, publicOrigin(request));
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      url.searchParams.set(k, v);
    }
  }
  return NextResponse.redirect(url);
}

/**
 * Gate : présence du cookie httpOnly dolci_access_token.
 * Swap /admin ↔ /proprietaire selon dolci_space (UX uniquement).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const space = request.cookies.get(OWNER_SPACE_COOKIE)?.value;
  const authed = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);

  const onAdmin =
    pathname === "/admin" ||
    (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/login"));
  const onProprietaire =
    pathname === "/proprietaire" || pathname.startsWith("/proprietaire/");
  const onCustomer =
    pathname === "/customer" || pathname.startsWith("/customer/");

  if ((onAdmin || onProprietaire || onCustomer) && !authed) {
    return redirectPublic(request, "/auth/sign-in", { next: pathname });
  }

  if (space === "owner" && onAdmin) {
    return redirectPublic(request, swapBackofficeBase(pathname, "host"));
  }

  if (space === "admin" && onProprietaire) {
    return redirectPublic(request, swapBackofficeBase(pathname, "admin"));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/proprietaire",
    "/proprietaire/:path*",
    "/customer",
    "/customer/:path*",
  ],
};
