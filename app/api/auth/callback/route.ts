import { NextRequest, NextResponse } from 'next/server'
import { getInsforgeServerClient } from '@/lib/insforge-server'
import { setSessionToken } from '@/lib/session'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const origin = url.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth_error=no_code`)
  }

  try {
    const client = getInsforgeServerClient()
    const { data, error } = await (client.auth as any).exchangeCodeForSession(code)

    if (error || !data) {
      return NextResponse.redirect(`${origin}/?auth_error=exchange_failed`)
    }

    const accessToken =
      (data as any)?.session?.access_token ||
      (data as any)?.access_token ||
      (data as any)?.token

    if (accessToken) {
      await setSessionToken(accessToken)
    }

    return NextResponse.redirect(origin)
  } catch {
    return NextResponse.redirect(`${origin}/?auth_error=callback_failed`)
  }
}
