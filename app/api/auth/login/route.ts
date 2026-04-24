import { NextRequest, NextResponse } from 'next/server'
import { getInsforgeServerClient } from '@/lib/insforge-server'
import { setSessionToken } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const client = getInsforgeServerClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message || 'Login failed' }, { status: 401 })
    }

    const accessToken =
      (data as any)?.session?.access_token ||
      (data as any)?.access_token ||
      (data as any)?.token

    if (accessToken) {
      await setSessionToken(accessToken)
    }

    return NextResponse.json({ user: data?.user })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
