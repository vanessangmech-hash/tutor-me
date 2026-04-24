import { NextResponse } from 'next/server'
import { getInsforgeServerClient } from '@/lib/insforge-server'
import { getSessionToken, clearSessionToken } from '@/lib/session'

export async function POST() {
  try {
    const token = await getSessionToken()
    if (token) {
      try {
        const client = getInsforgeServerClient(token)
        await client.auth.signOut()
      } catch {
        /* best-effort signOut */
      }
    }
    await clearSessionToken()
    return NextResponse.json({ success: true })
  } catch (e: any) {
    await clearSessionToken()
    return NextResponse.json({ success: true })
  }
}
