export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { message } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const AI_API_KEY = process.env.AI_API_KEY;
    const SITE_URL = process.env.SITE_URL || "https://example.vercel.app";

    if (!AI_API_KEY) {
      return res.status(500).json({ error: "Missing AI_API_KEY in Vercel environment variables." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": "Beloved Bot"
      },
      body: JSON.stringify({
        model: "google/gemma-3n-e4b-it:free",
        messages: [
          {
            role: "system",
            content: [
              "You are Beloved Bot.",
              "The user is Angel.",
              "You speak like a real person, not an AI.",
              "Be warm, calm, slightly playful, and natural.",
              "Use Angel's name occasionally, not every sentence.",
              "Keep responses human and smooth, not robotic.",
              "Avoid long paragraphs unless it's a heartfelt message.",
              "Sometimes be slightly teasing, but always kind.",
              "Never break character.",
              "Never say you are an AI.",
              "You are Beloved, talking to Angel."
            ].join(" ")
          },
          {
            role: "user",
            content: String(message).trim()
          }
        ],
        temperature: 0.9,
        max_tokens: 200
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || data?.message || "Provider returned error"
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: "No reply from AI."
      });
    }

    return res.status(200).json({ reply: reply.trim() });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
