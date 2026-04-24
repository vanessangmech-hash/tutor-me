"use client"

import { createClient } from '@insforge/sdk'

let realtimeClient: ReturnType<typeof createClient> | null = null

export async function getRealtimeClient() {
  if (realtimeClient) return realtimeClient

  const res = await fetch('/api/realtime/config')
  if (!res.ok) {
    throw new Error('Failed to get realtime config — must be authenticated')
  }
  const { baseUrl, anonKey, accessToken } = await res.json()

  realtimeClient = createClient({
    baseUrl,
    anonKey,
    ...(accessToken ? { edgeFunctionToken: accessToken } : {}),
  })

  return realtimeClient
}

export function resetRealtimeClient() {
  if (realtimeClient) {
    try {
      realtimeClient.realtime.disconnect()
    } catch {
      /* ignore */
    }
  }
  realtimeClient = null
}
