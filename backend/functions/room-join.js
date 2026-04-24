import { createClient } from 'npm:@insforge/sdk';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
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

  const body = await req.json().catch(() => ({}));

  if (req.method === 'POST') {
    const { room_code } = body;
    if (!room_code) return json({ error: 'room_code is required' }, 400);

    const { data: room, error: rErr } = await client.database
      .from('rooms')
      .select('id, room_code, host_id, persona_id, status, max_participants, settings, personas(id, name, subject)')
      .eq('room_code', room_code.toUpperCase())
      .eq('status', 'active')
      .maybeSingle();

    if (rErr || !room) return json({ error: 'Room not found or inactive' }, 404);

    const { data: existingMember } = await client.database
      .from('room_members')
      .select('id')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .is('left_at', null)
      .maybeSingle();

    if (existingMember) {
      return json({ message: 'Already in room', room });
    }

    const { data: activeMembers } = await client.database
      .from('room_members')
      .select('id', { count: 'exact' })
      .eq('room_id', room.id)
      .is('left_at', null);

    if (activeMembers && activeMembers.length >= room.max_participants) {
      return json({ error: 'Room is full' }, 403);
    }

    const role = room.host_id === userId ? 'host' : 'student';
    const { error: jErr } = await client.database
      .from('room_members')
      .insert({ room_id: room.id, user_id: userId, role });

    if (jErr) return json({ error: jErr.message }, 500);

    await client.realtime.connect();
    await client.realtime.publish(`presence:${room.id}`, 'user_joined', {
      user_id: userId,
      room_id: room.id,
      joined_at: new Date().toISOString(),
    });

    return json({ message: 'Joined room', room }, 200);
  }

  if (req.method === 'DELETE') {
    const { room_id } = body;
    if (!room_id) return json({ error: 'room_id is required' }, 400);

    const { data: member, error: mErr } = await client.database
      .from('room_members')
      .select('id')
      .eq('room_id', room_id)
      .eq('user_id', userId)
      .is('left_at', null)
      .maybeSingle();

    if (mErr || !member) return json({ error: 'Not a member of this room' }, 404);

    const { error: uErr } = await client.database
      .from('room_members')
      .update({ left_at: new Date().toISOString() })
      .eq('id', member.id);

    if (uErr) return json({ error: uErr.message }, 500);

    await client.realtime.connect();
    await client.realtime.publish(`presence:${room_id}`, 'user_left', {
      user_id: userId,
      room_id,
      left_at: new Date().toISOString(),
    });

    return json({ message: 'Left room' });
  }

  return json({ error: 'Method not allowed' }, 405);
}
