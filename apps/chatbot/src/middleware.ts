import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type AccessCheck = "allowed" | "denied" | "unavailable";

async function checkChatbotAccess(supabaseUrl: string, serviceRoleKey: string, userId: string): Promise<AccessCheck> {
  const endpoint = new URL("/rest/v1/chatbot_user_settings", supabaseUrl);
  endpoint.searchParams.set("select", "chatbot_access_enabled");
  endpoint.searchParams.set("user_id", `eq.${userId}`);
  endpoint.searchParams.set("limit", "1");
  const headers = new Headers({ apikey: serviceRoleKey });
  if (!serviceRoleKey.startsWith("sb_secret_")) {
    headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Chatbot access check could not reach Supabase", error);
    return "unavailable";
  }
  if (!response.ok) {
    console.error("Chatbot access check failed", { status: response.status });
    return "unavailable";
  }

  let settings: unknown;
  try {
    settings = await response.json();
  } catch (error) {
    console.error("Chatbot access check returned invalid JSON", error);
    return "unavailable";
  }
  if (!Array.isArray(settings)) {
    console.error("Chatbot access check returned an unexpected response");
    return "unavailable";
  }

  return settings.some((setting: { chatbot_access_enabled?: unknown }) => setting?.chatbot_access_enabled === true)
    ? "allowed"
    : "denied";
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const isLoginPage = path === "/login";
  const isPublicConfigRoute = path === "/api/auth/config";
  const isAccessDeniedPage = path === "/access-denied";
  const isPublicPwaResource =
    path === "/manifest.webmanifest" ||
    path === "/sw.js" ||
    path === "/offline.html" ||
    path.startsWith("/icons/");
  const isPublicRoute = isLoginPage || isPublicConfigRoute || isAccessDeniedPage || isPublicPwaResource;

  if (isPublicPwaResource) return response;

  if (!url || !key) {
    if (isPublicRoute) return response;
    return Response.json({ error: "Authentication is not configured" }, { status: 500 });
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]),
        );
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();

  if (user && !isAccessDeniedPage && !isPublicConfigRoute) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is required to enforce chatbot user access");
      return Response.json({ error: "Chat access control is temporarily unavailable" }, { status: 503 });
    }

    const access = await checkChatbotAccess(url, serviceRoleKey, user.id);
    if (access === "unavailable") {
      return Response.json({ error: "Chat access could not be verified" }, { status: 503 });
    }
    if (access === "denied") {
      if (path.startsWith("/api/")) {
        return Response.json({ error: "Your account is not enabled for SEED Chat. Contact an administrator." }, { status: 403 });
      }
      const destination = request.nextUrl.clone();
      destination.pathname = "/access-denied";
      destination.search = "";
      return NextResponse.redirect(destination);
    }
  }

  if (!user && !isPublicRoute) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  if (user && isLoginPage) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/";
    destination.search = "";
    return NextResponse.redirect(destination);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
