import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tasks = [], date } = req.body ?? {};

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const taskSummary = tasks.length
    ? tasks.map(t => `- [${t.completed ? 'done' : 'pending'}] (${t.priority}) ${t.text}`).join('\n')
    : 'No tasks yet today.';

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    messages: [
      {
        role: 'user',
        content: `You are a productivity coach helping someone plan their day (${date}).

Here are their current tasks:
${taskSummary}

Please respond with ONLY valid JSON (no markdown, no code fences) in this exact shape:
{
  "insight": "<one sentence observation about their current task list>",
  "suggestions": [
    { "text": "<task text>", "priority": "high" | "medium" | "low" },
    { "text": "<task text>", "priority": "high" | "medium" | "low" },
    { "text": "<task text>", "priority": "high" | "medium" | "low" }
  ]
}

Suggest 3 tasks that would make their day more productive and balanced. Do not duplicate tasks already in their list.`,
      },
    ],
  });

  const raw = message.content.find(b => b.type === 'text')?.text ?? '{}';

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { insight: 'Here are some tasks to consider adding.', suggestions: [] };
  }

  res.status(200).json(parsed);
}
