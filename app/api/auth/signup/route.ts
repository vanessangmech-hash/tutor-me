import { NextRequest, NextResponse } from 'next/server'
import { getInsforgeServerClient } from '@/lib/insforge-server'
import { setSessionToken } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, plan } = await request.json()
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email and password required' },
        { status: 400 }
      )
    }

    const client = getInsforgeServerClient()
    const { data, error } = await client.auth.signUp({ email, password, name })

    if (error) {
      return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 400 })
    }

    if ((data as any)?.requireEmailVerification) {
      return NextResponse.json(
        { requireEmailVerification: true, message: 'Please check your email to verify' },
        { status: 200 }
      )
    }

    const accessToken =
      (data as any)?.session?.access_token ||
      (data as any)?.access_token ||
      (data as any)?.token

    if (accessToken) {
      await setSessionToken(accessToken)
      const authedClient = getInsforgeServerClient(accessToken)
      try {
        await authedClient.auth.setProfile({ name, plan: plan || 'free' })
      } catch {
        /* setProfile is best-effort */
      }
    }

    return NextResponse.json({ user: data?.user })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
