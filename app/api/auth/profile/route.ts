import { NextRequest, NextResponse } from 'next/server'
import { getInsforgeServerClient } from '@/lib/insforge-server'
import { getSessionToken } from '@/lib/session'

export async function PUT(request: NextRequest) {
  try {
    const token = await getSessionToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const client = getInsforgeServerClient(token)
    const { data, error } = await client.auth.setProfile(body)

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to set profile' }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
