import { createClient } from '@insforge/sdk'
import 'server-only'

export function getInsforgeServerClient(userToken?: string) {
  const baseUrl = process.env.INSFORGE_BASE_URL
  const anonKey = process.env.INSFORGE_ANON_KEY

  if (!baseUrl || !anonKey) {
    throw new Error(
      'Missing server-side Insforge env vars: INSFORGE_BASE_URL and INSFORGE_ANON_KEY'
    )
  }

  return createClient({
    baseUrl,
    anonKey,
    ...(userToken ? { edgeFunctionToken: userToken } : {}),
  })
}

export function getInsforgeBaseUrl() {
  return process.env.INSFORGE_BASE_URL || ''
}

export function getInsforgeAnonKey() {
  return process.env.INSFORGE_ANON_KEY || ''
}
