import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verifică dacă coming soon este activat din environment variable
  const comingSoonEnabled = process.env.COMING_SOON === 'true'
  
  // Dacă coming soon nu este activat, lasă request-ul să continue normal
  if (!comingSoonEnabled) {
    return NextResponse.next()
  }

  // Exclude API routes și alte rute necesare
  const excludedPaths = [
    '/api/waitlist',
    '/api/toggle-coming-soon',
    '/api/stripe',
    '/coming-soon',
    '/_next',
    '/favicon.ico'
  ]

  // Verifică dacă ruta curentă este exclusă
  const isExcluded = excludedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isExcluded) {
    return NextResponse.next()
  }

  // Redirecționează către coming soon pentru toate celelalte rute
  const comingSoonUrl = new URL('/coming-soon', request.url)
  return NextResponse.redirect(comingSoonUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
