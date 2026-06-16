import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set in environment variables.' });
  }

  try {
    const { tasks = [], date } = req.body ?? {};

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const taskSummary = tasks.length
      ? tasks.map(t => `- [${t.completed ? 'done' : 'pending'}] (${t.priority}) ${t.text}`).join('\n')
      : 'No tasks yet today.';

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a productivity coach helping someone plan their day (${date}).

Here are their current tasks:
${taskSummary}

Respond with ONLY valid JSON, no markdown or code fences:
{
  "insight": "<one sentence observation about their task list>",
  "suggestions": [
    { "text": "<task>", "priority": "high" },
    { "text": "<task>", "priority": "medium" },
    { "text": "<task>", "priority": "low" }
  ]
}

Suggest 3 tasks that complement what they already have planned. Do not repeat existing tasks.`,
        },
      ],
    });

    const raw = message.content.find(b => b.type === 'text')?.text ?? '{}';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { insight: 'Here are some tasks to boost your day.', suggestions: [] };
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('suggest error:', err);
    return res.status(500).json({ error: err.message ?? 'Unknown error from Claude API.' });
  }
}
