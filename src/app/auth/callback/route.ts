import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/career/dashboard";

  if (code) {
    return NextResponse.redirect(
      `${origin}/career/auth?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`,
    );
  }

  return NextResponse.redirect(`${origin}/career/auth`);
}
