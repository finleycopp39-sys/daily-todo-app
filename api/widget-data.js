export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { uid } = req.query;
  if (!uid || uid.length < 8) {
    return res.status(400).json({ error: 'invalid uid' });
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey    = process.env.VITE_FIREBASE_API_KEY;
  if (!projectId || !apiKey) {
    return res.status(500).json({ error: 'server config missing' });
  }

  const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/widgetData/${uid}?key=${apiKey}`;

  if (req.method === 'GET') {
    try {
      const r = await fetch(docUrl);
      if (r.status === 404) {
        return res.status(200).json({ tasks: [], streak: 0, tasksDone: 0, tasksTotal: 0, accent: '#00d4ff' });
      }
      if (!r.ok) throw new Error(`Firestore ${r.status}`);
      const doc = await r.json();
      const data = parseDoc(doc.fields ?? {});
      res.setHeader('Cache-Control', 'public, max-age=900');
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const raw = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
      const payload = {
        accent:     String(raw.accent ?? '#00d4ff').slice(0, 10),
        streak:     Number.isInteger(raw.streak) ? raw.streak : 0,
        tasksTotal: Number.isInteger(raw.tasksTotal) ? raw.tasksTotal : 0,
        tasksDone:  Number.isInteger(raw.tasksDone) ? raw.tasksDone : 0,
        tasks: (Array.isArray(raw.tasks) ? raw.tasks.slice(0, 7) : []).map(t => ({
          text:     String(t.text ?? '').slice(0, 80),
          done:     !!t.done,
          priority: String(t.priority ?? 'medium'),
        })),
        updatedAt: new Date().toISOString(),
      };

      const r = await fetch(docUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: toDoc(payload) }),
      });
      if (!r.ok) throw new Error(`Firestore write ${r.status}`);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'method not allowed' });
}

function parseDoc(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if ('stringValue'  in v) out[k] = v.stringValue;
    else if ('integerValue' in v) out[k] = Number(v.integerValue);
    else if ('doubleValue'  in v) out[k] = v.doubleValue;
    else if ('booleanValue' in v) out[k] = v.booleanValue;
    else if ('arrayValue'   in v) {
      out[k] = (v.arrayValue.values ?? []).map(item => {
        if ('mapValue'     in item) return parseDoc(item.mapValue.fields ?? {});
        if ('stringValue'  in item) return item.stringValue;
        if ('integerValue' in item) return Number(item.integerValue);
        if ('booleanValue' in item) return item.booleanValue;
        return null;
      });
    }
    else if ('mapValue' in v) out[k] = parseDoc(v.mapValue.fields ?? {});
  }
  return out;
}

function toDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string')  fields[k] = { stringValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (typeof v === 'number' && Number.isInteger(v)) fields[k] = { integerValue: String(v) };
    else if (typeof v === 'number') fields[k] = { doubleValue: v };
    else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(item => {
            if (item && typeof item === 'object') return { mapValue: { fields: toDoc(item) } };
            if (typeof item === 'string')  return { stringValue: item };
            if (typeof item === 'boolean') return { booleanValue: item };
            if (typeof item === 'number')  return { integerValue: String(item) };
            return { nullValue: null };
          }),
        },
      };
    }
    else if (v !== null && typeof v === 'object') {
      fields[k] = { mapValue: { fields: toDoc(v) } };
    }
  }
  return fields;
}
