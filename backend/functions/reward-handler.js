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

export default async function (req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
    edgeFunctionToken: token,
  });

  const { data: userData } = await client.auth.getCurrentUser();
  const callerId = userData?.user?.id;

  const body = await req.json();
  const { room_id, user_id, persona_id, topic, understanding_score, message } = body;

  const effectiveUserId = user_id || callerId;
  if (!effectiveUserId) return json({ error: 'Unauthorized' }, 401);
  if (!room_id || !persona_id || !topic) {
    return json({ error: 'room_id, persona_id, and topic are required' }, 400);
  }

  // Insert reward record
  const { data: reward, error: rErr } = await client.database
    .from('rewards')
    .insert({
      room_id,
      user_id: effectiveUserId,
      persona_id,
      topic,
      understanding_score: understanding_score || 1.0,
    })
    .select()
    .single();

  if (rErr) return json({ error: rErr.message }, 500);

  // Increment persona total_rewards
  const { data: persona } = await client.database
    .from('personas')
    .select('total_rewards, teaching_style')
    .eq('id', persona_id)
    .maybeSingle();

  if (persona) {
    await client.database
      .from('personas')
      .update({ total_rewards: (persona.total_rewards || 0) + 1 })
      .eq('id', persona_id);
  }

  // Update learning progress
  const { data: progress } = await client.database
    .from('learning_progress')
    .select('*')
    .eq('user_id', effectiveUserId)
    .eq('persona_id', persona_id)
    .maybeSingle();

  if (progress) {
    const mastered = progress.topics_mastered || [];
    if (!mastered.includes(topic)) mastered.push(topic);

    await client.database
      .from('learning_progress')
      .update({
        topics_mastered: mastered,
        total_rewards: (progress.total_rewards || 0) + 1,
      })
      .eq('id', progress.id);
  } else {
    await client.database.from('learning_progress').insert({
      user_id: effectiveUserId,
      persona_id,
      topics_mastered: [topic],
      total_rewards: 1,
      interaction_count: 0,
    });
  }

  // Adaptive teaching style adjustment based on reward accumulation
  if (persona && progress) {
    const totalRewards = (progress.total_rewards || 0) + 1;
    const interactions = progress.interaction_count || 1;
    const rewardRate = totalRewards / interactions;

    const style = { ...(persona.teaching_style || {}) };

    // High reward rate = student understands quickly, can increase complexity
    if (rewardRate > 0.5) {
      style.detail_level = 'advanced';
      style.approach = style.approach === 'socratic' ? 'socratic' : 'exploratory';
    } else if (rewardRate > 0.25) {
      style.detail_level = 'moderate';
    } else {
      // Low reward rate = student struggling, simplify
      style.detail_level = 'beginner';
      style.approach = 'step-by-step';
      style.encouragement = true;
    }

    await client.database
      .from('personas')
      .update({ teaching_style: style })
      .eq('id', persona_id);
  }

  return json({
    reward,
    message: 'Reward recorded and persona adapted',
  });
}
