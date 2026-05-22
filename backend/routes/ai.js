const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.post('/bio-suggestion', auth, async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ message: 'ANTHROPIC_API_KEY not configured' });
  }

  const { name, title, skills } = req.body;
  const skillList = (skills || []).slice(0, 10).join(', ');

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Write a compelling, professional developer bio (2-3 sentences, under 200 words) for:
Name: ${name || 'Developer'}
Title: ${title || 'Full Stack Developer'}
Skills: ${skillList || 'web development'}

Requirements:
- First person, confident tone
- Mention key skills naturally
- End with passion or goal
- No buzzwords like "passionate", "driven"
- Return only the bio text, nothing else`,
      }],
    });

    const bio = msg.content[0].text.trim();
    res.json({ bio });
  } catch (err) {
    console.error('AI bio error:', err.message);
    res.status(500).json({ message: 'AI generation failed' });
  }
});

router.post('/seo-tags', auth, async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ message: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const user = await User.findById(req.user.id).select('profile templateConfig');
    const name = user?.profile?.name || 'Developer';
    const title = user?.profile?.title || 'Full Stack Developer';
    const bio = user?.profile?.bio || '';

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Generate SEO meta tags for a developer portfolio.
Name: ${name}
Title: ${title}
Bio: ${bio.substring(0, 200)}

Return ONLY a JSON object with exactly two keys:
- "title": an SEO page title under 60 characters including the person's name and role
- "description": a meta description under 155 characters summarizing who they are and what they do

No markdown, no explanation, just the JSON object.`,
      }],
    });

    const raw = msg.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ message: 'Could not parse AI response' });
    const tags = JSON.parse(jsonMatch[0]);

    // Save to user
    await User.findByIdAndUpdate(req.user.id, { seoConfig: tags });

    res.json(tags);
  } catch (err) {
    console.error('SEO tags error:', err.message);
    res.status(500).json({ message: 'SEO generation failed' });
  }
});

module.exports = router;
