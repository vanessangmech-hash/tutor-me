import { createClient } from 'npm:@insforge/sdk';

let _anonClient = null;

export function getAnonClient() {
  if (!_anonClient) {
    _anonClient = createClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
      anonKey: Deno.env.get('ANON_KEY'),
    });
  }
  return _anonClient;
}

export function getAuthClient(request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  return createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
    edgeFunctionToken: token,
  });
}

export async function getCurrentUserId(client) {
  const { data } = await client.auth.getCurrentUser();
  return data?.user?.id || null;
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export function optionsResponse() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
