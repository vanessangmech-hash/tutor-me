import { NextRequest, NextResponse } from 'next/server'
import { getInsforgeServerClient } from '@/lib/insforge-server'
import { getSessionToken } from '@/lib/session'

async function proxy(
  request: NextRequest,
  fn: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
) {
  try {
    const token = await getSessionToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const queryString = url.searchParams.toString()
    const fnPath = queryString ? `${fn}?${queryString}` : fn

    let body: any = undefined
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.json()
      } catch {
        body = undefined
      }
    } else if (method === 'DELETE') {
      try {
        body = await request.json()
      } catch {
        body = undefined
      }
    }

    const client = getInsforgeServerClient(token)
    const { data, error } = await client.functions.invoke(fnPath, {
      method,
      ...(body !== undefined ? { body } : {}),
    })

    if (error) {
      return NextResponse.json({ error: error.message || 'Function failed' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fn: string }> }
) {
  const { fn } = await context.params
  return proxy(request, fn, 'GET')
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ fn: string }> }
) {
  const { fn } = await context.params
  return proxy(request, fn, 'POST')
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ fn: string }> }
) {
  const { fn } = await context.params
  return proxy(request, fn, 'PATCH')
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ fn: string }> }
) {
  const { fn } = await context.params
  return proxy(request, fn, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ fn: string }> }
) {
  const { fn } = await context.params
  return proxy(request, fn, 'DELETE')
}
