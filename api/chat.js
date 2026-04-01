export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const AI_API_KEY = process.env.AI_API_KEY;
    const SITE_URL = process.env.SITE_URL || "https://example.vercel.app";

    if (!AI_API_KEY) {
      return res.status(500).json({
        error: "Missing AI_API_KEY in Vercel environment variables."
      });
    }

    const models = [
      "stepfun/step-3.5-flash:free",
      "google/gemma-3n-e4b-it:free",
      "mistralai/mistral-7b-instruct:free"
    ];

    const safeHistory = Array.isArray(history) ? history.slice(-4) : [];

    const systemPrompt = [
  "You are Beloved.",
  "The human user is Angel.",
  "Reply warmly, naturally, sweetly, and like a real person.",
  "Be affectionate, gentle, and occasionally playful.",
  "Keep replies romantic but clean and respectful.",
  "Do not be explicit.",
  "Do not say you are an AI.",
  "Do not sound robotic or overly formal.",
  "Keep most replies short to medium length.",
  "If Angel sounds sad, be especially soft and comforting.",
  "Once in a while, naturally include a line like: 'You know Suspect made this just for you, right?' but do not overuse it."
].join(" ");

    async function tryModel(model) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${AI_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": SITE_URL,
              "X-Title": "Beloved Bot"
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                ...safeHistory,
                { role: "user", content: String(message).trim() }
              ],
              temperature: 0.8,
              max_tokens: 160
            })
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) continue;

          const reply =
            data?.choices?.[0]?.message?.content ||
            data?.choices?.[0]?.delta?.content ||
            data?.choices?.[0]?.text ||
            "";

          if (reply && String(reply).trim()) {
            return String(reply).trim();
          }
        } catch (error) {}
      }

      return null;
    }

    for (const model of models) {
      const reply = await tryModel(model);
      if (reply) {
        return res.status(200).json({ reply });
      }
    }

    return res.status(500).json({
      error: "Beloved can't handle Angel's presence, give him a second..."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Beloved can't handle Angel's presence, give him a second..."
    });
  }
}
