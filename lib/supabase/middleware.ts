import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 1. Refresh session (keep existing logic)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Protected routes logic
  // "s" routes and "dashboard" routes are now publicly accessible BUT
  // specific pages will handle their own "unauthorized" state or redirect logic.
  // The user specifically asked for middleware to ALLOW access.
  // We can still protect /onboard or /settings if we want, but for simplicity
  // and since we moved auth checks to page-level for public access, 
  // we can relax this global guard.

  // If you want to protect SPECIFIC private-only routes like /onboard globally:
  const isProtectedGlobal = /^\/onboard/.test(request.nextUrl.pathname);

  if (isProtectedGlobal && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login"; // or /register
    return NextResponse.redirect(url);
  }

  // Allow all other traffic (dashboard handles its own public/private logic)
  return response;
};
