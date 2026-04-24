import { NextResponse } from 'next/server'
import { getInsforgeServerClient } from '@/lib/insforge-server'
import { getSessionToken } from '@/lib/session'

export async function GET() {
  try {
    const token = await getSessionToken()
    if (!token) {
      return NextResponse.json({ user: null })
    }

    const client = getInsforgeServerClient(token)
    const { data, error } = await client.auth.getCurrentUser()

    if (error || !data?.user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: data.user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
