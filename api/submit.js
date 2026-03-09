function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let payload = req.body;
  if (!payload || typeof payload === 'string') {
    try {
      const raw = typeof payload === 'string' ? payload : await readBody(req);
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = {};
    }
  }

  const name = String(payload.name || '').trim();
  const phone = String(payload.phone || '').trim();
  const address = String(payload.address || '').trim();
  const service = String(payload.service || '').trim();
  const description = String(payload.description || '').trim();

  if (!name || !phone || !address || !service) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const text = `🔧 New order\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nService: ${service}\nDescription: ${description}`;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  } else {
    console.log(text);
  }

  res.status(200).json({ ok: true });
}
