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

// ── Ghost DB helpers (inline to keep edge function self-contained) ──

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

async function getContext(roomId) {
  const rows = await ghostQuery('SELECT * FROM conversation_context WHERE room_id = $1', [roomId]);
  return rows[0] || null;
}

async function upsertContext(roomId, messages, summary, tokenCount) {
  await ghostQuery(
    `INSERT INTO conversation_context (room_id, messages, summary, token_count)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (room_id) DO UPDATE SET messages = $2, summary = $3, token_count = $4, updated_at = now()`,
    [roomId, JSON.stringify(messages), summary, tokenCount]
  );
}

async function storeEmbedding(personaId, topic, content, embedding, sourceUrl) {
  await ghostQuery(
    `INSERT INTO topic_embeddings (persona_id, topic, content, embedding, source_url) VALUES ($1,$2,$3,$4,$5)`,
    [personaId, topic, content, JSON.stringify(embedding), sourceUrl]
  );
}

// ── TinyFish web research (calls the web-research function internally) ──

async function doWebResearch(insforge, userMessage, subject, personaId, roomId) {
  try {
    const { data, error } = await insforge.functions.invoke('web-research', {
      body: {
        user_query: userMessage,
        subject,
        persona_id: personaId,
        room_id: roomId,
      },
    });
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Understanding detection ──

const UNDERSTANDING_SIGNALS = [
  'i understand', 'i get it', 'that makes sense', 'oh i see',
  'got it', 'now i understand', 'makes sense now', 'clear now',
  'thanks, i understand', 'perfect, that clarifies', 'ah, so that means',
];

function detectUnderstanding(message) {
  const lower = message.toLowerCase();
  return UNDERSTANDING_SIGNALS.some((s) => lower.includes(s));
}

// ── Build system prompt ──

function buildSystemPrompt(persona, learningStyle, researchContext) {
  let prompt = persona.system_prompt;

  prompt += `\n\nYou are ${persona.name}, a ${persona.subject} professor.`;

  const style = persona.teaching_style || {};
  if (style.approach) prompt += ` Your teaching approach is ${style.approach}.`;
  if (style.detail_level) prompt += ` You explain at a ${style.detail_level} detail level.`;

  if (learningStyle && learningStyle.primary !== 'unknown') {
    prompt += `\n\nThis student's learning style is primarily ${learningStyle.primary}.`;
    if (learningStyle.preferences?.examples) prompt += ' They learn best with concrete examples.';
    if (learningStyle.preferences?.analogies) prompt += ' They respond well to analogies.';
    if (learningStyle.preferences?.step_by_step) prompt += ' They prefer step-by-step explanations.';
  }

  if (researchContext?.summary) {
    prompt += `\n\n[LIVE RESEARCH CONTEXT]\nThe following information was gathered from the internet to help answer the student's question:\n${researchContext.summary}`;
    if (researchContext.sources?.length) {
      prompt += '\n\nSources:';
      researchContext.sources.forEach((s) => {
        prompt += `\n- ${s.title}: ${s.url}`;
      });
    }
    prompt += '\n[END RESEARCH CONTEXT]\nUse this research to provide accurate, up-to-date information. Cite sources when relevant.';
  }

  prompt += '\n\nWhen you believe the student has demonstrated understanding of a concept, acknowledge it warmly.';
  prompt += ' If the student seems confused, try a different explanation approach.';

  return prompt;
}

// ── Sliding window context management ──

const MAX_CONTEXT_MESSAGES = 40;
const MAX_TOKEN_ESTIMATE = 6000;

function trimContext(messages) {
  if (messages.length <= MAX_CONTEXT_MESSAGES) return messages;
  return messages.slice(-MAX_CONTEXT_MESSAGES);
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
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

  const { data: userData } = await insforge.auth.getCurrentUser();
  const userId = userData?.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  const { room_id, message } = await req.json();
  if (!room_id || !message) return json({ error: 'room_id and message are required' }, 400);

  // Load room + persona
  const { data: room, error: roomErr } = await insforge.database
    .from('rooms')
    .select('*, personas(*)')
    .eq('id', room_id)
    .eq('status', 'active')
    .maybeSingle();

  if (roomErr || !room) return json({ error: 'Room not found or inactive' }, 404);
  const persona = room.personas;

  // Load learning progress
  const { data: progress } = await insforge.database
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('persona_id', persona.id)
    .maybeSingle();

  const learningStyle = progress?.learning_style || { primary: 'unknown', preferences: {} };

  // Load conversation context from Ghost
  const existingContext = await getContext(room_id);
  let contextMessages = existingContext?.messages || [];

  // Run web research via TinyFish (parallel with context loading)
  const researchContext = await doWebResearch(insforge, message, persona.subject, persona.id, room_id);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(persona, learningStyle, researchContext);

  // Assemble messages for AI
  const aiMessages = [
    { role: 'system', content: systemPrompt },
  ];

  if (existingContext?.summary) {
    aiMessages.push({ role: 'system', content: `Previous conversation summary: ${existingContext.summary}` });
  }

  contextMessages.forEach((m) => {
    aiMessages.push({ role: m.role, content: m.content });
  });
  aiMessages.push({ role: 'user', content: message });

  // Call AI
  const completion = await insforge.ai.chat.completions.create({
    model: 'openai/gpt-4o',
    messages: aiMessages,
    temperature: 0.7,
    maxTokens: 1024,
  });

  const aiResponse = completion.choices[0]?.message?.content || 'I apologize, I had trouble formulating a response.';

  // Store user message
  await insforge.database.from('messages').insert({
    room_id,
    sender_id: userId,
    sender_type: 'user',
    content: message,
    message_type: detectUnderstanding(message) ? 'answer' : 'question',
  });

  // Store AI response
  await insforge.database.from('messages').insert({
    room_id,
    sender_id: persona.id,
    sender_type: 'agent',
    content: aiResponse,
    message_type: 'answer',
    metadata: researchContext?.sources ? { sources: researchContext.sources } : {},
  });

  // Update conversation context in Ghost
  contextMessages.push({ role: 'user', content: message });
  contextMessages.push({ role: 'assistant', content: aiResponse });
  contextMessages = trimContext(contextMessages);

  const totalTokens = contextMessages.reduce((sum, m) => sum + estimateTokens(m.content), 0);

  let summary = existingContext?.summary || '';
  if (totalTokens > MAX_TOKEN_ESTIMATE) {
    const summarizeResp = await insforge.ai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: 'Summarize this conversation in 2-3 sentences, focusing on topics discussed and student understanding.' },
        { role: 'user', content: contextMessages.map((m) => `${m.role}: ${m.content}`).join('\n') },
      ],
      maxTokens: 200,
    });
    summary = summarizeResp.choices[0]?.message?.content || summary;
    contextMessages = contextMessages.slice(-10);
  }

  await upsertContext(room_id, contextMessages, summary, totalTokens);

  // Generate embedding for the exchange and store
  try {
    const embeddingResp = await insforge.ai.embeddings.create({
      model: 'openai/text-embedding-3-small',
      input: `Q: ${message}\nA: ${aiResponse}`,
    });
    const embedding = embeddingResp.data[0]?.embedding;
    if (embedding) {
      await storeEmbedding(persona.id, persona.subject, `Q: ${message}\nA: ${aiResponse}`, embedding, null);
    }
  } catch (_) { /* embedding storage is best-effort */ }

  // Update learning progress interaction count
  if (progress) {
    await insforge.database
      .from('learning_progress')
      .update({ interaction_count: (progress.interaction_count || 0) + 1 })
      .eq('id', progress.id);
  } else {
    await insforge.database.from('learning_progress').insert({
      user_id: userId,
      persona_id: persona.id,
      interaction_count: 1,
    });
  }

  // Check for understanding and trigger reward
  let rewardGranted = false;
  if (detectUnderstanding(message)) {
    try {
      await insforge.functions.invoke('reward-handler', {
        body: {
          room_id,
          user_id: userId,
          persona_id: persona.id,
          topic: persona.subject,
          understanding_score: 0.9,
          message,
        },
      });
      rewardGranted = true;
    } catch (_) { /* reward is best-effort */ }
  }

  return json({
    response: aiResponse,
    reward_granted: rewardGranted,
    sources: researchContext?.sources || [],
  });
}
