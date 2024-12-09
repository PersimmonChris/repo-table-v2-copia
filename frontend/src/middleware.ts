import { createClient } from '@/utils/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Crea il client Supabase
    const { supabase, response } = createClient(request)

    // IMPORTANTE: Non inserire logica tra createClient e getUser
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Lista delle rotte pubbliche che non richiedono autenticazione
    const publicRoutes = ['/login', '/auth/confirm']
    const isPublicRoute = publicRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )

    // Se l'utente non è autenticato e sta cercando di accedere a una rotta protetta
    if (!user && !isPublicRoute) {
        const redirectUrl = new URL('/login', request.url)
        // Salva l'URL originale per reindirizzare dopo il login
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Se l'utente è autenticato e sta cercando di accedere alla pagina di login
    if (user && request.nextUrl.pathname.startsWith('/login')) {
        const redirectUrl = new URL('/', request.url)
        return NextResponse.redirect(redirectUrl)
    }

    // IMPORTANTE: Ritorniamo sempre il response object dal middleware
    // per mantenere i cookie di sessione sincronizzati
    return response
}

// Configura su quali path il middleware deve essere eseguito
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}