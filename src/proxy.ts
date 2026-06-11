import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const cookies = request.cookies.getAll()
  const sbCookies = cookies.filter(c => c.name.startsWith('sb-'))
  if (sbCookies.length > 3) {
    sbCookies.forEach(cookie => response.cookies.delete(cookie.name))
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}