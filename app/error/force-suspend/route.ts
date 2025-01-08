// app/error/force-suspend/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Build absolute URL to /error/suspended
  const suspendedUrl = new URL("/error/suspended", request.url);
  const res = NextResponse.redirect(suspendedUrl);

  // Remove common NextAuth cookies
  const expires = new Date(0); // Or: new Date(Date.now() - 100000)

  res.cookies.set("next-auth.session-token", "", { expires });
  res.cookies.set("__Secure-next-auth.session-token", "", { expires });
  // If you're using the default cookie name for CSRF:
  res.cookies.set("next-auth.csrf-token", "", { expires });
  res.cookies.set("__Host-next-auth.csrf-token", "", { expires });
  // Potentially remove callback-url if it’s set:
  res.cookies.set("__Secure-next-auth.callback-url", "", { expires });
  res.cookies.set("next-auth.callback-url", "", { expires });

  return res;
}
