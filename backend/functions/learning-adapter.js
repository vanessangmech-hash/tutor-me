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
  const userId = userData?.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  const { persona_id } = await req.json();
  if (!persona_id) return json({ error: 'persona_id is required' }, 400);

  // Get learning progress
  const { data: progress } = await client.database
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('persona_id', persona_id)
    .maybeSingle();

  if (!progress) return json({ error: 'No learning history found' }, 404);

  // Get recent messages to analyze interaction patterns
  const { data: recentRooms } = await client.database
    .from('rooms')
    .select('id')
    .eq('persona_id', persona_id)
    .eq('status', 'active');

  const roomIds = (recentRooms || []).map((r) => r.id);
  let recentMessages = [];

  if (roomIds.length > 0) {
    const { data: msgs } = await client.database
      .from('messages')
      .select('*')
      .in('room_id', roomIds)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    recentMessages = msgs || [];
  }

  // Analyze patterns
  const patterns = analyzePatterns(recentMessages);

  // Use AI to classify learning style
  const analysisPrompt = `Analyze the following student interaction patterns and classify their learning style.

Patterns observed:
- Average message length: ${patterns.avgLength} characters
- Questions asked: ${patterns.questionCount} out of ${patterns.totalMessages} messages
- Topics revisited: ${patterns.revisitedTopics.join(', ') || 'none'}
- Prefers examples: ${patterns.asksForExamples ? 'yes' : 'no'}
- Prefers analogies: ${patterns.asksForAnalogies ? 'yes' : 'no'}
- Prefers step-by-step: ${patterns.asksForSteps ? 'yes' : 'no'}
- Prefers visual aids: ${patterns.asksForVisuals ? 'yes' : 'no'}
- Topics mastered: ${(progress.topics_mastered || []).join(', ') || 'none yet'}
- Reward rate: ${progress.total_rewards}/${progress.interaction_count} interactions

Respond with ONLY a JSON object (no markdown):
{
  "primary": "visual|auditory|reading|kinesthetic",
  "secondary": "visual|auditory|reading|kinesthetic",
  "preferences": {
    "examples": true/false,
    "analogies": true/false,
    "step_by_step": true/false,
    "visual_aids": true/false,
    "practice_problems": true/false,
    "discussion": true/false
  },
  "recommended_approach": "brief description of best teaching approach",
  "system_prompt_modifier": "additional instructions to add to the professor's system prompt"
}`;

  const completion = await client.ai.chat.completions.create({
    model: 'openai/gpt-4o',
    messages: [
      { role: 'system', content: 'You are a learning analytics expert. Classify learning styles based on interaction data.' },
      { role: 'user', content: analysisPrompt },
    ],
    temperature: 0.3,
    maxTokens: 500,
  });

  let learningStyle;
  try {
    const raw = completion.choices[0]?.message?.content || '{}';
    learningStyle = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
  } catch {
    learningStyle = {
      primary: 'reading',
      secondary: 'visual',
      preferences: { examples: true, step_by_step: true },
      recommended_approach: 'balanced approach with examples',
      system_prompt_modifier: '',
    };
  }

  // Update learning progress
  await client.database
    .from('learning_progress')
    .update({ learning_style: learningStyle })
    .eq('id', progress.id);

  return json({
    learning_style: learningStyle,
    patterns,
    message: 'Learning style analyzed and updated',
  });
}

function analyzePatterns(messages) {
  if (!messages.length) {
    return {
      avgLength: 0, questionCount: 0, totalMessages: 0,
      revisitedTopics: [], asksForExamples: false,
      asksForAnalogies: false, asksForSteps: false, asksForVisuals: false,
    };
  }

  const totalMessages = messages.length;
  const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0);
  const avgLength = Math.round(totalLength / totalMessages);

  const questionCount = messages.filter((m) =>
    m.content.includes('?') || m.message_type === 'question'
  ).length;

  const lower = messages.map((m) => m.content.toLowerCase());

  const wordFreq = {};
  lower.forEach((text) => {
    const words = text.split(/\s+/).filter((w) => w.length > 4);
    words.forEach((w) => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  });
  const revisitedTopics = Object.entries(wordFreq)
    .filter(([_, count]) => count >= 3)
    .map(([word]) => word)
    .slice(0, 5);

  const asksForExamples = lower.some((t) => /example|show me|for instance|such as/.test(t));
  const asksForAnalogies = lower.some((t) => /like what|analogy|compare|similar to/.test(t));
  const asksForSteps = lower.some((t) => /step by step|how do i|walk me through|procedure/.test(t));
  const asksForVisuals = lower.some((t) => /diagram|picture|visual|draw|chart|graph/.test(t));

  return {
    avgLength, questionCount, totalMessages,
    revisitedTopics, asksForExamples, asksForAnalogies, asksForSteps, asksForVisuals,
  };
}
