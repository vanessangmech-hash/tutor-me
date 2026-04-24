import { NextResponse } from 'next/server'
import { getSessionToken } from '@/lib/session'

export async function GET() {
  try {
    const token = await getSessionToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      baseUrl: process.env.INSFORGE_BASE_URL,
      anonKey: process.env.INSFORGE_ANON_KEY,
      accessToken: token,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
