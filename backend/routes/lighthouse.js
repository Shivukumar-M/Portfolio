const express = require('express');
const router = express.Router();
const https = require('https');
const auth = require('../middleware/auth');

// Calls Google PageSpeed Insights API (no key required for basic use)
router.post('/audit', auth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'URL is required' });

  const encoded = encodeURIComponent(url);
  const apiKey = process.env.PAGESPEED_API_KEY || '';
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encoded}&strategy=mobile&category=performance&category=accessibility&category=seo${keyParam}`;

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(apiUrl, (response) => {
        let body = '';
        response.on('data', chunk => { body += chunk; });
        response.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch { reject(new Error('Invalid JSON from PageSpeed API')); }
        });
      }).on('error', reject);
    });

    if (data.error) {
      return res.status(400).json({ message: data.error.message || 'PageSpeed API error' });
    }

    const cats = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};

    const scores = {
      performance:   Math.round((cats.performance?.score   || 0) * 100),
      accessibility: Math.round((cats.accessibility?.score || 0) * 100),
      seo:           Math.round((cats.seo?.score           || 0) * 100),
    };

    // Pull top 3 actionable failed/warning audits
    const tips = Object.values(audits)
      .filter(a => a.score !== null && a.score < 0.9 && a.description)
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .slice(0, 3)
      .map(a => ({
        title: a.title,
        description: a.description.replace(/\[.*?\]\(.*?\)/g, '').substring(0, 150),
        score: Math.round((a.score || 0) * 100),
      }));

    res.json({ scores, tips, url });
  } catch (err) {
    console.error('Lighthouse audit error:', err.message);
    res.status(500).json({ message: 'Audit failed: ' + err.message });
  }
});

module.exports = router;
