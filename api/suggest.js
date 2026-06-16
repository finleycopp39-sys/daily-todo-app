import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in environment variables.' });
  }

  try {
    const { tasks = [], date } = req.body ?? {};

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const taskSummary = tasks.length
      ? tasks.map(t => `- [${t.completed ? 'done' : 'pending'}] (${t.priority}) ${t.text}`).join('\n')
      : 'No tasks yet today.';

    const prompt = `You are a productivity coach helping someone plan their day (${date}).

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

Suggest 3 tasks that complement what they already have planned. Do not repeat existing tasks.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    let parsed;
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { insight: 'Here are some tasks to boost your day.', suggestions: [] };
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('suggest error:', err);
    return res.status(500).json({ error: err.message ?? 'Unknown error from Gemini API.' });
  }
}
