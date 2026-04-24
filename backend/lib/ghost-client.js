const GHOST_CONNECTION_STRING = Deno.env.get('GHOST_CONNECTION_STRING');

async function query(sql, params = []) {
  const { default: postgres } = await import('https://deno.land/x/postgresjs@v3.4.5/mod.js');
  const sql_client = postgres(GHOST_CONNECTION_STRING, { max: 1 });
  try {
    if (params.length > 0) {
      const result = await sql_client.unsafe(sql, params);
      return result;
    }
    const result = await sql_client.unsafe(sql);
    return result;
  } finally {
    await sql_client.end();
  }
}

export async function getConversationContext(roomId) {
  const rows = await query(
    'SELECT * FROM conversation_context WHERE room_id = $1',
    [roomId]
  );
  return rows[0] || null;
}

export async function upsertConversationContext(roomId, messages, summary, tokenCount) {
  await query(
    `INSERT INTO conversation_context (room_id, messages, summary, token_count)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (room_id) DO UPDATE SET
       messages = $2, summary = $3, token_count = $4, updated_at = now()`,
    [roomId, JSON.stringify(messages), summary, tokenCount]
  );
}

export async function storeTopicEmbedding(personaId, topic, content, embedding, sourceUrl) {
  await query(
    `INSERT INTO topic_embeddings (persona_id, topic, content, embedding, source_url)
     VALUES ($1, $2, $3, $4, $5)`,
    [personaId, topic, content, JSON.stringify(embedding), sourceUrl]
  );
}

export async function matchTopicEmbeddings(embedding, personaId, threshold = 0.78, count = 5) {
  const rows = await query(
    `SELECT id, persona_id, topic, content, source_url,
            1 - (embedding <=> $1::vector) AS similarity
     FROM topic_embeddings
     WHERE persona_id = $2
       AND 1 - (embedding <=> $1::vector) > $3
     ORDER BY embedding <=> $1::vector
     LIMIT $4`,
    [JSON.stringify(embedding), personaId, threshold, count]
  );
  return rows;
}

export async function getCachedResearch(queryHash) {
  const rows = await query(
    `SELECT * FROM research_cache
     WHERE query_hash = $1
       AND created_at + (ttl_hours || ' hours')::interval > now()`,
    [queryHash]
  );
  return rows[0] || null;
}

export async function matchResearchCache(embedding, subject, threshold = 0.85, count = 3) {
  const rows = await query(
    `SELECT id, query, subject, sources, extracted_content,
            1 - (embedding <=> $1::vector) AS similarity,
            (created_at + (ttl_hours || ' hours')::interval < now()) AS is_expired
     FROM research_cache
     WHERE subject = $2
       AND 1 - (embedding <=> $1::vector) > $3
     ORDER BY embedding <=> $1::vector
     LIMIT $4`,
    [JSON.stringify(embedding), subject, threshold, count]
  );
  return rows.filter(r => !r.is_expired);
}

export async function storeResearchCache(queryHash, queryText, subject, sources, content, embedding) {
  await query(
    `INSERT INTO research_cache (query_hash, query, subject, sources, extracted_content, embedding)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (query_hash) DO UPDATE SET
       sources = $4, extracted_content = $5, embedding = $6, created_at = now()`,
    [queryHash, queryText, subject, JSON.stringify(sources), content, JSON.stringify(embedding)]
  );
}

export async function logResearch(roomId, userId, userQuery, searchQueries, sourcesUsed, summary) {
  await query(
    `INSERT INTO call_research_log (room_id, user_id, user_query, search_queries, sources_used, research_summary)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [roomId, userId, userQuery, JSON.stringify(searchQueries), JSON.stringify(sourcesUsed), summary]
  );
}
