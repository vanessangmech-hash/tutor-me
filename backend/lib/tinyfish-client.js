const TINYFISH_API_KEY = Deno.env.get('TINYFISH_API_KEY');
const TINYFISH_BASE_URL = Deno.env.get('TINYFISH_BASE_URL') || 'https://api.tinyfish.ai/v1';

async function tinyfishRequest(endpoint, body) {
  const resp = await fetch(`${TINYFISH_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TINYFISH_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`TinyFish API error ${resp.status}: ${text}`);
  }
  return resp.json();
}

export async function search(query, options = {}) {
  return tinyfishRequest('/search', {
    query,
    location: options.location || 'US',
    language: options.language || 'en',
    page: options.page || 0,
  });
}

export async function fetchContent(urls, options = {}) {
  return tinyfishRequest('/fetch', {
    urls: Array.isArray(urls) ? urls : [urls],
    format: options.format || 'markdown',
    links: options.links || false,
    image_links: options.image_links || false,
  });
}

export async function runWebAutomation(url, goal, options = {}) {
  const sessionId = crypto.randomUUID();
  return tinyfishRequest('/run', {
    url,
    goal,
    session_id: sessionId,
    browser_profile: options.browser_profile || 'lite',
    agent_config: {
      mode: options.mode || 'default',
      max_steps: options.max_steps || 50,
    },
  });
}

export async function getRunStatus(runId) {
  const resp = await fetch(`${TINYFISH_BASE_URL}/runs/${runId}`, {
    headers: { 'Authorization': `Bearer ${TINYFISH_API_KEY}` },
  });
  if (!resp.ok) throw new Error(`TinyFish get_run error: ${resp.status}`);
  return resp.json();
}
