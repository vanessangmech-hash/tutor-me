import { NextRequest, NextResponse } from 'next/server'
import { getInsforgeServerClient } from '@/lib/insforge-server'
import { setSessionToken } from '@/lib/session'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('insforge_code') || url.searchParams.get('code')
  const origin = url.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth_error=no_code`)
  }

  const codeVerifier = request.cookies.get('insforge_pkce_verifier')?.value

  try {
    const client = getInsforgeServerClient()
    const { data, error } = await client.auth.exchangeOAuthCode(code, codeVerifier)

    if (error || !data) {
      return NextResponse.redirect(`${origin}/?auth_error=exchange_failed`)
    }

    const accessToken =
      (data as any)?.accessToken ||
      (data as any)?.session?.accessToken ||
      (data as any)?.session?.access_token ||
      (data as any)?.access_token ||
      (data as any)?.token

    if (!accessToken) {
      return NextResponse.redirect(`${origin}/?auth_error=no_access_token`)
    }

    await setSessionToken(accessToken)

    const response = NextResponse.redirect(origin)
    response.cookies.delete('insforge_pkce_verifier')
    return response
  } catch {
    return NextResponse.redirect(`${origin}/?auth_error=callback_failed`)
  }
}
