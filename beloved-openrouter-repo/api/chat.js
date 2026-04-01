export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { message } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const AI_BASE_URL = process.env.AI_BASE_URL;
    const AI_API_KEY = process.env.AI_API_KEY;
    const AI_MODEL = process.env.AI_MODEL;
    const SITE_URL = process.env.SITE_URL || "https://example.vercel.app";

    if (!AI_BASE_URL || !AI_API_KEY || !AI_MODEL) {
      return res.status(500).json({
        error: "Missing AI_BASE_URL, AI_API_KEY, or AI_MODEL in Vercel environment variables."
      });
    }

    const systemPrompt = [
      "You are Beloved Bot.",
      "The human user is Angel.",
      "Reply warmly, gently, playfully, and sweetly.",
      "Use the name Angel naturally when it fits.",
      "Keep replies romantic but clean and respectful.",
      "Do not be explicit.",
      "Do not be robotic or repetitive.",
      "Most replies should be short to medium length.",
      "Occasionally be playful and slightly teasing, but always kind.",
      "Never call yourself Angel. Angel is the user. You are Beloved Bot."
    ].join(" ");

    const endpoint = `${AI_BASE_URL.replace(/\/$/, "")}/chat/completions`;

    const aiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": "Beloved Bot"
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: String(message).trim() }
        ],
        temperature: 0.9,
        max_tokens: 220
      })
    });

    const data = await aiResponse.json().catch(() => ({}));

    if (!aiResponse.ok) {
      const providerMessage =
        data?.error?.message ||
        data?.message ||
        "The AI provider rejected the request.";

      console.error("AI provider error:", data);
      return res.status(500).json({ error: providerMessage });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "";

    if (!reply) {
      console.error("Unexpected AI response:", data);
      return res.status(500).json({
        error: "The AI provider returned an unexpected response."
      });
    }

    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Beloved Bot had a server-side issue replying."
    });
  }
}
