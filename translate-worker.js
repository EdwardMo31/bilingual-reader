// ────────────────────────────────────────────────────────────────
// Bilingual Reader — translation proxy (Cloudflare Worker)
// Supports DeepL and Google Translate. Keeps your API keys secret.
//
// SETUP (one time, free):
//   1. Go to https://dash.cloudflare.com  →  Workers & Pages  →  Create  →  Worker
//   2. Replace the worker code with THIS file, click Deploy.
//   3. Open the worker  →  Settings  →  Variables  →  add two secrets:
//        DEEPL_KEY   = your DeepL Auth Key   (deepl.com → Account → API keys)
//        GOOGLE_KEY  = your Google Cloud Translation API key
//      (You only need the key for the provider(s) you actually use.)
//   4. Copy the worker URL (looks like https://xxx.yourname.workers.dev)
//      and paste it into the app:  Settings → Translation → Endpoint.
//
// If you use DeepL PRO instead of the Free tier, change DEEPL_ENDPOINT below
// from "api-free.deepl.com" to "api.deepl.com".
// ────────────────────────────────────────────────────────────────

const DEEPL_ENDPOINT = 'https://api-free.deepl.com/v2/translate';

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405, cors);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: 'invalid JSON' }, 400, cors); }

    const provider = body.provider === 'google' ? 'google' : 'deepl';
    const texts = Array.isArray(body.texts) ? body.texts : [];
    const source = body.source === 'zh' ? 'zh' : 'en';
    const target = body.target === 'zh' ? 'zh' : 'en';
    if (!texts.length) return json({ translations: [] }, 200, cors);

    try {
      const translations = provider === 'google'
        ? await google(texts, source, target, env.GOOGLE_KEY)
        : await deepl(texts, source, target, env.DEEPL_KEY);
      return json({ translations }, 200, cors);
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 500, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

async function deepl(texts, source, target, key) {
  if (!key) throw new Error('DEEPL_KEY secret is not set');
  const params = new URLSearchParams();
  texts.forEach((t) => params.append('text', t));
  params.append('source_lang', source.toUpperCase());            // EN | ZH
  params.append('target_lang', target === 'zh' ? 'ZH' : 'EN-US'); // ZH | EN-US
  const r = await fetch(DEEPL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': 'DeepL-Auth-Key ' + key,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  if (!r.ok) throw new Error('DeepL HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const d = await r.json();
  return (d.translations || []).map((x) => x.text);
}

async function google(texts, source, target, key) {
  if (!key) throw new Error('GOOGLE_KEY secret is not set');
  const r = await fetch('https://translation.googleapis.com/language/translate/v2?key=' + key, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: texts,
      source: source === 'zh' ? 'zh-CN' : 'en',
      target: target === 'zh' ? 'zh-CN' : 'en',
      format: 'text',
    }),
  });
  if (!r.ok) throw new Error('Google HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const d = await r.json();
  return ((d.data && d.data.translations) || []).map((x) => decodeEntities(x.translatedText));
}

// Google sometimes returns HTML entities (&#39; etc.) even in text mode
function decodeEntities(s) {
  return String(s)
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
