import { NextRequest, NextResponse } from 'next/server'
import { getInsforgeServerClient } from '@/lib/insforge-server'

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  const redirectTo = `${origin}/api/auth/callback`

  try {
    const client = getInsforgeServerClient()
    const { data, error } = await (client.auth as any).signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    if (error || !data?.url) {
      return NextResponse.redirect(`${origin}/?auth_error=oauth_failed`)
    }

    return NextResponse.redirect(data.url)
  } catch {
    return NextResponse.redirect(`${origin}/?auth_error=oauth_unavailable`)
  }
}
