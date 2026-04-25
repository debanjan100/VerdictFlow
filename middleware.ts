import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) { 
            request.cookies.set({ name, value, ...options }); 
            response = NextResponse.next({ request: { headers: request.headers } }); 
            response.cookies.set({ name, value, ...options }) 
        },
        remove(name, options) { 
            request.cookies.set({ name, value: '', ...options }); 
            response = NextResponse.next({ request: { headers: request.headers } }); 
            response.cookies.set({ name, value: '', ...options }) 
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protect /dashboard and all sub-routes
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/cases/:path*', '/upload'],
}
