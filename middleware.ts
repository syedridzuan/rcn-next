import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const session = await auth()

    // Check if it's a dashboard route
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      // No session, redirect to login
      if (!session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Not an admin, redirect to home
      if (session.user?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    
    // On error, redirect to home page
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
