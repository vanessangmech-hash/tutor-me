import { createClient } from 'npm:@insforge/sdk';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function getClient(req) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  return createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
    edgeFunctionToken: token,
  });
}

async function getUserId(client) {
  const { data } = await client.auth.getCurrentUser();
  return data?.user?.id || null;
}

export default async function (req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const client = getClient(req);
  const userId = await getUserId(client);
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  const url = new URL(req.url);
  const body = req.method !== 'GET' ? await req.json().catch(() => ({})) : {};

  if (req.method === 'POST') {
    const { name, subject, system_prompt, personality_traits, teaching_style, is_public } = body;
    if (!name || !subject || !system_prompt) {
      return json({ error: 'name, subject, and system_prompt are required' }, 400);
    }

    const { data: persona, error } = await client.database
      .from('personas')
      .insert({
        creator_id: userId,
        name,
        subject,
        system_prompt,
        personality_traits: personality_traits || {},
        teaching_style: teaching_style || {
          approach: 'socratic',
          detail_level: 'moderate',
          encouragement: true,
        },
        is_public: is_public || false,
      })
      .select()
      .single();

    if (error) return json({ error: error.message }, 500);
    return json({ persona }, 201);
  }

  if (req.method === 'GET') {
    const personaId = url.searchParams.get('id');
    const listPublic = url.searchParams.get('public') === 'true';
    const subject = url.searchParams.get('subject');

    if (personaId) {
      const { data: persona, error } = await client.database
        .from('personas')
        .select('*')
        .eq('id', personaId)
        .maybeSingle();
      if (error || !persona) return json({ error: 'Persona not found' }, 404);

      if (!persona.is_public && persona.creator_id !== userId) {
        return json({ error: 'Access denied' }, 403);
      }
      return json({ persona });
    }

    let query = client.database.from('personas').select('*');

    if (listPublic) {
      query = query.eq('is_public', true);
      if (subject) query = query.ilike('subject', `%${subject}%`);
      query = query.order('total_rewards', { ascending: false }).limit(50);
    } else {
      query = query.eq('creator_id', userId);
    }

    const { data, error } = await query;
    if (error) return json({ error: error.message }, 500);
    return json({ personas: data });
  }

  if (req.method === 'PUT') {
    const { persona_id, name, subject, system_prompt, personality_traits, teaching_style, is_public } = body;
    if (!persona_id) return json({ error: 'persona_id is required' }, 400);

    const { data: existing } = await client.database
      .from('personas')
      .select('creator_id')
      .eq('id', persona_id)
      .maybeSingle();
    if (!existing) return json({ error: 'Persona not found' }, 404);
    if (existing.creator_id !== userId) return json({ error: 'Only the creator can update this persona' }, 403);

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (subject !== undefined) updates.subject = subject;
    if (system_prompt !== undefined) updates.system_prompt = system_prompt;
    if (personality_traits !== undefined) updates.personality_traits = personality_traits;
    if (teaching_style !== undefined) updates.teaching_style = teaching_style;
    if (is_public !== undefined) updates.is_public = is_public;

    const { data: persona, error } = await client.database
      .from('personas')
      .update(updates)
      .eq('id', persona_id)
      .select()
      .single();

    if (error) return json({ error: error.message }, 500);
    return json({ persona });
  }

  if (req.method === 'PATCH') {
    const { persona_id } = body;
    if (!persona_id) return json({ error: 'persona_id is required to fork' }, 400);

    const { data: source, error: sErr } = await client.database
      .from('personas')
      .select('*')
      .eq('id', persona_id)
      .maybeSingle();

    if (sErr || !source) return json({ error: 'Source persona not found' }, 404);
    if (!source.is_public && source.creator_id !== userId) {
      return json({ error: 'Cannot fork a private persona you do not own' }, 403);
    }

    const { data: forked, error: fErr } = await client.database
      .from('personas')
      .insert({
        creator_id: userId,
        name: `${source.name} (forked)`,
        subject: source.subject,
        system_prompt: source.system_prompt,
        personality_traits: source.personality_traits,
        teaching_style: source.teaching_style,
        is_public: false,
      })
      .select()
      .single();

    if (fErr) return json({ error: fErr.message }, 500);
    return json({ persona: forked, forked_from: persona_id }, 201);
  }

  return json({ error: 'Method not allowed' }, 405);
}
