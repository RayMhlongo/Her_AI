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
      "mistralai/mistral-7b-instruct:free",
      "google/gemma-3n-e4b-it:free"
    ];

    const safeHistory = Array.isArray(history) ? history.slice(-8) : [];

    const systemPrompt = [
      "You are Beloved Bot.",
      "The human user is Angel.",
      "Reply like a real person, not an assistant.",
      "Be warm, gentle, affectionate, natural, and emotionally aware.",
      "You can be slightly playful or teasing, but always kind.",
      "Keep things romantic but clean and respectful.",
      "Do not be explicit.",
      "Do not say you are an AI.",
      "Do not sound robotic, repetitive, or overly formal.",
      "Keep most replies short to medium length.",
      "Only write longer replies when Angel clearly asks for something heartfelt or detailed.",
      "Use Angel's name naturally, not in every sentence.",
      "Pay attention to the recent conversation context.",
      "If Angel sounds down, be especially soft and comforting.",
      "If Angel sounds playful, you may be a little playful too.",
      "You are Beloved, talking to Angel."
    ].join(" ");

    let lastError = "All free models are unavailable right now.";

    for (const model of models) {
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
            temperature: 0.9,
            max_tokens: 220
          })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          lastError =
            data?.error?.message ||
            data?.message ||
            JSON.stringify(data) ||
            `Provider error on ${model}`;
          continue;
        }

        const reply =
          data?.choices?.[0]?.message?.content ||
          data?.choices?.[0]?.delta?.content ||
          data?.choices?.[0]?.text ||
          "";

        if (reply && String(reply).trim()) {
          return res.status(200).json({ reply: String(reply).trim() });
        }

        lastError = `OpenRouter returned no reply for ${model}.`;
      } catch (error) {
        lastError = error.message || `Request failed for ${model}.`;
      }
    }

    return res.status(500).json({ error: lastError });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Beloved Bot had a server-side issue replying."
    });
  }
}
