import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas públicas — não exigem autenticação
const publicRoutes = [
  "/",
  "/login",
  "/recuperar-conta",
  "/sobre",
  "/contato",
  "/conheca",
  "/precos",
  "/compra",
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === "/") return pathname === "/"
    return pathname === route || pathname.startsWith(route + "/")
  })
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Verificar token JWT no cookie (salvo no login via client-side)
  // O cookie "monettra_auth_token" é definido pelo use-auth-store após login bem-sucedido
  const authToken =
    request.cookies.get("monettra_auth_token") ||
    // Fallback: cookie legado (simulado) para não quebrar sessões existentes
    request.cookies.get("babylos-auth-token")

  if (!authToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon*, apple-icon* (metadata files)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
