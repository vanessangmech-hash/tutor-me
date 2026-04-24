import { createClient } from 'npm:@insforge/sdk';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// ── TinyFish API helpers ──

const TINYFISH_API_KEY = Deno.env.get('TINYFISH_API_KEY');
const TINYFISH_BASE = Deno.env.get('TINYFISH_BASE_URL') || 'https://api.tinyfish.ai/v1';

async function tfRequest(endpoint, body) {
  const resp = await fetch(`${TINYFISH_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TINYFISH_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`TinyFish ${endpoint} error ${resp.status}: ${text}`);
  }
  return resp.json();
}

async function tfSearch(query) {
  return tfRequest('/search', { query, location: 'US', language: 'en' });
}

async function tfFetchContent(urls) {
  return tfRequest('/fetch', {
    urls: Array.isArray(urls) ? urls.slice(0, 5) : [urls],
    format: 'markdown',
    links: false,
    image_links: false,
  });
}

// ── Ghost DB helpers ──

const GHOST_CONN = Deno.env.get('GHOST_CONNECTION_STRING');

async function ghostQuery(sql, params = []) {
  const { default: postgres } = await import('https://deno.land/x/postgresjs@v3.4.5/mod.js');
  const pg = postgres(GHOST_CONN, { max: 1 });
  try {
    return params.length > 0 ? await pg.unsafe(sql, params) : await pg.unsafe(sql);
  } finally {
    await pg.end();
  }
}

function hashQuery(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

async function getCachedByHash(queryHash) {
  const rows = await ghostQuery(
    `SELECT * FROM research_cache
     WHERE query_hash = $1
       AND created_at + (ttl_hours || ' hours')::interval > now()`,
    [queryHash]
  );
  return rows[0] || null;
}

async function getCachedBySimilarity(embedding, subject) {
  const rows = await ghostQuery(
    `SELECT id, query, subject, sources, extracted_content,
            1 - (embedding <=> $1::vector) AS similarity,
            (created_at + (ttl_hours || ' hours')::interval < now()) AS is_expired
     FROM research_cache
     WHERE subject = $2
       AND embedding IS NOT NULL
       AND 1 - (embedding <=> $1::vector) > 0.85
     ORDER BY embedding <=> $1::vector
     LIMIT 1`,
    [JSON.stringify(embedding), subject]
  );
  const match = rows[0];
  if (match && !match.is_expired) return match;
  return null;
}

async function storeCache(queryHash, queryText, subject, sources, content, embedding) {
  await ghostQuery(
    `INSERT INTO research_cache (query_hash, query, subject, sources, extracted_content, embedding)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (query_hash) DO UPDATE SET
       sources = $4, extracted_content = $5, embedding = $6, created_at = now()`,
    [queryHash, queryText, subject, JSON.stringify(sources), content, JSON.stringify(embedding)]
  );
}

async function logResearch(roomId, userId, userQuery, searchQueries, sourcesUsed, summary) {
  await ghostQuery(
    `INSERT INTO call_research_log (room_id, user_id, user_query, search_queries, sources_used, research_summary)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [roomId, userId, userQuery, JSON.stringify(searchQueries), JSON.stringify(sourcesUsed), summary]
  );
}

async function storeTopicEmbedding(personaId, topic, content, embedding, sourceUrl) {
  await ghostQuery(
    `INSERT INTO topic_embeddings (persona_id, topic, content, embedding, source_url) VALUES ($1,$2,$3,$4,$5)`,
    [personaId, topic, content, JSON.stringify(embedding), sourceUrl]
  );
}

// ── Main handler ──

export default async function (req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  const insforge = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
    edgeFunctionToken: token,
  });

  const body = await req.json();
  const { user_query, subject, persona_id, room_id, user_id } = body;

  if (!user_query || !subject) {
    return json({ error: 'user_query and subject are required' }, 400);
  }

  // Skip research for trivial messages (greetings, short responses)
  if (user_query.length < 15 || /^(hi|hello|hey|thanks|ok|yes|no|bye|good)\b/i.test(user_query)) {
    return json({ summary: null, sources: [], raw_content: '' });
  }

  try {
    // Step 1: Build search query from user question + subject
    const searchQuery = `${subject} ${user_query}`;
    const queryHash = hashQuery(searchQuery.toLowerCase().trim());

    // Step 2: Check cache (exact hash match)
    const cached = await getCachedByHash(queryHash);
    if (cached) {
      await logResearch(room_id, user_id, user_query, [searchQuery], cached.sources, cached.extracted_content);
      return json({
        summary: cached.extracted_content,
        sources: typeof cached.sources === 'string' ? JSON.parse(cached.sources) : cached.sources,
        raw_content: cached.extracted_content,
        from_cache: true,
      });
    }

    // Step 3: Check cache (embedding similarity)
    let queryEmbedding;
    try {
      const embResp = await insforge.ai.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: searchQuery,
      });
      queryEmbedding = embResp.data[0]?.embedding;
    } catch {
      queryEmbedding = null;
    }

    if (queryEmbedding) {
      const similar = await getCachedBySimilarity(queryEmbedding, subject);
      if (similar) {
        await logResearch(room_id, user_id, user_query, [searchQuery],
          typeof similar.sources === 'string' ? JSON.parse(similar.sources) : similar.sources,
          similar.extracted_content);
        return json({
          summary: similar.extracted_content,
          sources: typeof similar.sources === 'string' ? JSON.parse(similar.sources) : similar.sources,
          raw_content: similar.extracted_content,
          from_cache: true,
        });
      }
    }

    // Step 4: Cache miss -- search the web via TinyFish
    const searchResults = await tfSearch(searchQuery);
    const results = searchResults?.results || searchResults?.organic || [];
    if (!results.length) {
      return json({ summary: null, sources: [], raw_content: '', message: 'No search results found' });
    }

    // Extract top URLs
    const topResults = results.slice(0, 5);
    const urls = topResults.map((r) => r.url || r.link).filter(Boolean);
    const sources = topResults.map((r) => ({
      url: r.url || r.link,
      title: r.title || '',
      snippet: r.snippet || r.description || '',
    }));

    // Step 5: Fetch content from top URLs
    let extractedContent = '';
    try {
      const fetched = await tfFetchContent(urls);
      const pages = fetched?.results || fetched?.pages || [];
      extractedContent = pages
        .map((p) => {
          const content = p.content || p.text || p.markdown || '';
          // Truncate each page to ~2000 chars to stay within token limits
          return content.substring(0, 2000);
        })
        .filter(Boolean)
        .join('\n\n---\n\n');
    } catch {
      // Fall back to snippets if fetch fails
      extractedContent = sources.map((s) => `${s.title}: ${s.snippet}`).join('\n');
    }

    // Step 6: Summarize extracted content via AI
    let summary = extractedContent;
    if (extractedContent.length > 500) {
      try {
        const sumResp = await insforge.ai.chat.completions.create({
          model: 'openai/gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a research assistant. Summarize the following web content into a concise, educational explanation relevant to the subject "${subject}" and the student's question. Focus on key facts, concepts, and explanations. Keep it under 500 words.`,
            },
            { role: 'user', content: `Student's question: ${user_query}\n\nWeb content:\n${extractedContent.substring(0, 8000)}` },
          ],
          temperature: 0.3,
          maxTokens: 600,
        });
        summary = sumResp.choices[0]?.message?.content || extractedContent;
      } catch {
        summary = extractedContent.substring(0, 2000);
      }
    }

    // Step 7: Cache the results
    if (queryEmbedding) {
      await storeCache(queryHash, searchQuery, subject, sources, summary, queryEmbedding);
    }

    // Step 8: Store topic embeddings for future semantic lookup
    if (persona_id && queryEmbedding) {
      try {
        await storeTopicEmbedding(persona_id, subject, summary.substring(0, 2000), queryEmbedding, urls[0] || null);
      } catch { /* best-effort */ }
    }

    // Step 9: Log the research
    await logResearch(room_id, user_id, user_query, [searchQuery], sources, summary);

    return json({
      summary,
      sources,
      raw_content: extractedContent.substring(0, 3000),
      from_cache: false,
    });

  } catch (err) {
    console.error('Web research error:', err);
    return json({
      summary: null,
      sources: [],
      raw_content: '',
      error: err.message,
    });
  }
}
