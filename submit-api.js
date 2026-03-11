function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function parsePayload(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  const contentType = String(req.headers['content-type'] || '');

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  if (contentType.includes('application/json')) {
    try {
      const raw = await readRawBody(req);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  return {};
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload = await parsePayload(req);

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

  try {
    if (botToken && chatId) {
      const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const tgResponse = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text })
      });

      if (!tgResponse.ok) {
        const tgBody = await tgResponse.text();
        res.status(502).json({ error: 'Telegram API error', detail: tgBody.slice(0, 500) });
        return;
      }
    } else {
      console.log(text);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal error', detail: String(error && error.message ? error.message : error) });
  }
};
