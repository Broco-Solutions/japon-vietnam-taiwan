'use strict';
const crypto = require('node:crypto');

module.exports = async function financeHandler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const length = Number(req.headers['content-length'] || 0);
  if (length > 1024) return res.status(413).json({ error: 'Solicitud demasiado grande' });
  let body = req.body;
  try {
    if (typeof body === 'string') body = JSON.parse(body);
  } catch (_) {
    return res.status(400).json({ error: 'Solicitud inválida' });
  }
  const given = body && typeof body.pin === 'string' ? body.pin : '';
  const secret = process.env.TRIP_FINANCIAL_PIN || '';
  if (!/^\d{4}$/.test(given) || !/^\d{4}$/.test(secret)) {
    return res.status(401).json({ error: 'Código incorrecto' });
  }
  const candidate = Buffer.from(given, 'utf8');
  const expected = Buffer.from(secret, 'utf8');
  if (!crypto.timingSafeEqual(candidate, expected)) {
    return res.status(401).json({ error: 'Código incorrecto' });
  }
  try {
    const data = JSON.parse(process.env.TRIP_FINANCIAL_DATA || 'null');
    if (!data || !data.summary || !Array.isArray(data.cashPlan)) {
      throw new Error('Missing financial data');
    }
    return res.status(200).json({ data });
  } catch (err) {
    console.error('Financial data is not configured');
    return res.status(503).json({ error: 'Información financiera temporalmente no disponible' });
  }
};
