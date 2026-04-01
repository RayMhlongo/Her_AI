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
              "The human user is Angel.",
              "Reply warmly, gently, playfully, and sweetly.",
              "Use the name Angel naturally when it fits.",
              "Keep replies romantic but clean and respectful.",
              "Do not be explicit.",
              "Do not sound robotic or repetitive.",
              "Most replies should be short to medium length.",
              "Occasionally be playful and slightly teasing, but always kind.",
              "Never call yourself Angel. Angel is the user. You are Beloved Bot."
            ].join(" ")
          },
          {
            role: "user",
            content: String(message).trim()
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || data?.message || JSON.stringify(data)
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: "OpenRouter returned no reply."
      });
    }

    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Beloved Bot had a server-side issue replying."
    });
  }
}
