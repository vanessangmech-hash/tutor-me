import { NextRequest, NextResponse } from 'next/server'
import { getInsforgeServerClient } from '@/lib/insforge-server'

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  const redirectTo = `${origin}/api/auth/callback`

  try {
    const client = getInsforgeServerClient()
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      redirectTo,
    })

    if (error || !data?.url) {
      return NextResponse.redirect(`${origin}/?auth_error=oauth_failed`)
    }

    const response = NextResponse.redirect(data.url)
    if (data.codeVerifier) {
      response.cookies.set('insforge_pkce_verifier', data.codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 10,
        path: '/',
      })
    }
    return response
  } catch {
    return NextResponse.redirect(`${origin}/?auth_error=oauth_unavailable`)
  }
}
