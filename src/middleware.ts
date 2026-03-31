import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const protectedRoutes = ['/os', '/estoque', '/vendas', '/impressao', '/notificacoes', '/dashboard']
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verificar sessão
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se é rota protegida e não tem autenticação
  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Se é rota de auth e já está autenticado
  if (authRoutes.includes(request.nextUrl.pathname)) {
    if (user) {
      return NextResponse.redirect(new URL('/os', request.url))
    }
  }

  // Se é root e está autenticado, redirecionar para /os
  if (request.nextUrl.pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/os', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
