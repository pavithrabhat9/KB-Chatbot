export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ response: null, error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, kbArticles } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ response: null, error: 'Message is required' });
    }

    if (!kbArticles || !Array.isArray(kbArticles)) {
      return res.status(400).json({ response: null, error: 'kbArticles must be an array' });
    }

    // Check if knowledge base is configured
    if (kbArticles.length === 0) {
      return res.status(200).json({
        response: 'No knowledge base configured. Please contact your admin.',
        error: null,
      });
    }

    // Build system prompt
    const systemPrompt = `You are a helpful assistant. Answer questions ONLY using the provided knowledge base.
If the answer is not found in the knowledge base, respond with EXACTLY: 'I don't have that information.'
Keep responses concise and helpful.

Knowledge Base Articles:
${kbArticles
  .map((article) => `[${article.title}]: ${article.content}`)
  .join('\n\n')}`;

    // Call Groq API
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(200).json({
        response: null,
        error: 'AI service not configured.',
      });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      if (groqResponse.status === 429) {
        return res.status(200).json({
          response: null,
          error: 'Rate limit exceeded. Try again later.',
        });
      }

      const errorText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errorText);
      return res.status(200).json({
        response: null,
        error: 'AI service error. Please try again.',
      });
    }

    const data = await groqResponse.json();
    const responseText = data.choices?.[0]?.message?.content;

    if (!responseText) {
      return res.status(200).json({
        response: null,
        error: 'AI service error. Please try again.',
      });
    }

    return res.status(200).json({
      response: responseText,
      error: null,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(200).json({
      response: null,
      error: 'Network error. Please try again.',
    });
  }
}