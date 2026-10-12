import { type NextRequest, NextResponse } from 'next/server'

// Checagem rápida de presença do cookie de sessão, direto no edge, antes de
// renderizar a página. Só confere se o cookie existe — a verificação de
// assinatura/validade de verdade acontece no servidor (src/lib/auth/session.ts),
// já que o Admin SDK/crypto não roda no runtime do middleware.
const SESSION_COOKIE = 'bs_session'
const ROTAS_PUBLICAS = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (ROTAS_PUBLICAS.includes(pathname)) {
    return NextResponse.next()
  }

  const temSessao = request.cookies.has(SESSION_COOKIE)
  if (!temSessao) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
