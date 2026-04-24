import { createClient } from 'npm:@insforge/sdk';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
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
    const { persona_id, max_participants, settings } = body;
    if (!persona_id) return json({ error: 'persona_id is required' }, 400);

    const { data: persona, error: pErr } = await client.database
      .from('personas')
      .select('id')
      .eq('id', persona_id)
      .maybeSingle();
    if (pErr || !persona) return json({ error: 'Persona not found' }, 404);

    let roomCode = generateRoomCode();
    let retries = 0;
    while (retries < 5) {
      const { data: existing } = await client.database
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .maybeSingle();
      if (!existing) break;
      roomCode = generateRoomCode();
      retries++;
    }

    const { data: room, error: rErr } = await client.database
      .from('rooms')
      .insert({
        room_code: roomCode,
        host_id: userId,
        persona_id,
        max_participants: max_participants || 30,
        settings: settings || { allow_voice: true, allow_chat: true, auto_reward: true },
      })
      .select()
      .single();

    if (rErr) return json({ error: rErr.message }, 500);

    await client.database.from('room_members').insert({
      room_id: room.id,
      user_id: userId,
      role: 'host',
    });

    await client.database
      .from('personas')
      .update({ times_used: persona.times_used ? persona.times_used + 1 : 1 })
      .eq('id', persona_id);

    return json({ room }, 201);
  }

  if (req.method === 'GET') {
    const roomCode = url.searchParams.get('code');
    const roomId = url.searchParams.get('id');
    const listActive = url.searchParams.get('list_active');

    if (listActive === 'true') {
      const { data, error } = await client.database
        .from('rooms')
        .select('*, personas(id, name, subject, system_prompt, teaching_style)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) return json({ error: error.message }, 500);
      return json({ rooms: data || [] });
    }

    let query = client.database
      .from('rooms')
      .select('*, personas(id, name, subject, system_prompt, teaching_style)');

    if (roomCode) query = query.eq('room_code', roomCode);
    else if (roomId) query = query.eq('id', roomId);
    else {
      query = query.eq('host_id', userId).eq('status', 'active');
      const { data, error } = await query;
      if (error) return json({ error: error.message }, 500);
      return json({ rooms: data });
    }

    const { data: room, error } = await query.maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!room) return json({ error: 'Room not found' }, 404);

    const { data: members } = await client.database
      .from('room_members')
      .select('user_id, role, joined_at')
      .eq('room_id', room.id)
      .is('left_at', null);

    return json({ room, members: members || [] });
  }

  if (req.method === 'PUT') {
    const { room_id, settings, max_participants } = body;
    if (!room_id) return json({ error: 'room_id is required' }, 400);

    const { data: room } = await client.database
      .from('rooms')
      .select('host_id')
      .eq('id', room_id)
      .maybeSingle();
    if (!room) return json({ error: 'Room not found' }, 404);
    if (room.host_id !== userId) return json({ error: 'Only the host can update the room' }, 403);

    const updates = {};
    if (settings) updates.settings = settings;
    if (max_participants) updates.max_participants = max_participants;

    const { data, error } = await client.database
      .from('rooms')
      .update(updates)
      .eq('id', room_id)
      .select()
      .single();

    if (error) return json({ error: error.message }, 500);
    return json({ room: data });
  }

  if (req.method === 'DELETE') {
    const { room_id } = body;
    if (!room_id) return json({ error: 'room_id is required' }, 400);

    const { data: room } = await client.database
      .from('rooms')
      .select('host_id')
      .eq('id', room_id)
      .maybeSingle();
    if (!room) return json({ error: 'Room not found' }, 404);
    if (room.host_id !== userId) return json({ error: 'Only the host can archive the room' }, 403);

    const { data, error } = await client.database
      .from('rooms')
      .update({ status: 'archived' })
      .eq('id', room_id)
      .select()
      .single();

    if (error) return json({ error: error.message }, 500);
    return json({ room: data });
  }

  return json({ error: 'Method not allowed' }, 405);
}
