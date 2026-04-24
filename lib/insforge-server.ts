import { createClient } from '@insforge/sdk'
import 'server-only'

const INSFORGE_BASE_URL = process.env.INSFORGE_BASE_URL || ''
const INSFORGE_ANON_KEY = process.env.INSFORGE_ANON_KEY || ''

if (!INSFORGE_BASE_URL || !INSFORGE_ANON_KEY) {
  throw new Error(
    'Missing server-side Insforge env vars: INSFORGE_BASE_URL and INSFORGE_ANON_KEY'
  )
}

export function getInsforgeServerClient(userToken?: string) {
  return createClient({
    baseUrl: INSFORGE_BASE_URL,
    anonKey: INSFORGE_ANON_KEY,
    ...(userToken ? { edgeFunctionToken: userToken } : {}),
  })
}

export { INSFORGE_BASE_URL, INSFORGE_ANON_KEY }
