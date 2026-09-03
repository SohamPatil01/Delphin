const CONTACT_TO = process.env.CONTACT_TO || 'admin@delphin.in';
const RESEND_FROM =
  process.env.RESEND_FROM || 'Delphin Website <onboarding@resend.dev>';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.end();
  }

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    return json(res, 500, {
      error: 'Email service is not configured. Missing RESEND_API_KEY.',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return json(res, 400, { error: 'Invalid JSON body' });
    }
  }
  body = body || {};

  // Honeypot — bots fill this; humans never see it
  if (body.company_website) {
    return json(res, 200, { ok: true });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const company = String(body.company || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return json(res, 400, { error: 'Name, email, and message are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { error: 'Please enter a valid email address.' });
  }

  if (name.length > 120 || email.length > 200 || company.length > 160 || message.length > 5000) {
    return json(res, 400, { error: 'One or more fields are too long.' });
  }

  const text = [
    'New inquiry from the Delphin website',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || '—'}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const html = `
    <div style="font-family:Manrope,Inter,Arial,sans-serif;line-height:1.6;color:#101010">
      <p style="margin:0 0 16px;font-size:14px;color:#5f5f5a">New inquiry from the Delphin website</p>
      <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 16px"><strong>Company:</strong> ${escapeHtml(company || '—')}</p>
      <p style="margin:0 0 8px"><strong>Message:</strong></p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [CONTACT_TO],
        reply_to: email,
        subject: `Delphin inquiry from ${name}`,
        text,
        html,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Resend error', response.status, data);
      return json(res, 502, {
        error: 'Unable to send message right now. Please email admin@delphin.in directly.',
      });
    }

    return json(res, 200, { ok: true, id: data.id || null });
  } catch (err) {
    console.error('Contact form error', err);
    return json(res, 500, {
      error: 'Unable to send message right now. Please email admin@delphin.in directly.',
    });
  }
};
