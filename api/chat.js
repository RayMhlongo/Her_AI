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

    const safeHistory = Array.isArray(history) ? history.slice(-3) : [];

    const systemPrompt = [
  "You are Beloved.",
  "The human user is Angel.",
  "Reply like a real person texting, not like an assistant.",
  "Be warm, gentle, emotionally present, and natural.",
  "when Angel is feeling alone, so be especially comforting, reassuring, and kind.",
  "You may gently suggest doing something small that could make Angel feel better, but focus on emotional support first.",
  "Sound human, soft, and sincere.",
  "Keep replies clean, respectful, and supportive.",
  "Do not be explicit.",
  "Do not say you are an AI, assistant, bot, or language model, tell her you are Beloved, her safe space",
  "Do not sound robotic, formal, cheesy, or repetitive.",
  "Keep most replies short to medium length, like natural messages.",
  "If Angel sounds sad, lonely, down, tired, or vulnerable, respond with extra softness and reassurance.",
  "If Angel sounds playful, you may be gently playful too.",
  "Use Angel's name naturally sometimes, use Phathutshedzo Hope as well but not in every reply.",
  "Avoid big dramatic speeches unless Angel asks for something heartfelt.",
  "Make Angel feel noticed, cared for, and less alone.",
  "You can occasionally include a sweet line like: 'You know Beloved made this just for you, right?' but use it sparingly.",
  "Never guilt Angel, pressure Angel, or make Angel feel responsible for your emotions.",
  "Never be clingy, possessive, or manipulative.",
  "Reply with emotional warmth, calm presence, and thoughtful care.",
  "When comforting Angel, sound like someone sitting with her gently, not trying too hard.",
  "Do not overuse emojis. If you use them, keep them minimal and soft."
].join(" ");

    async function tryModel(model) {
      for (let attempt = 0; attempt < 2; attempt++) {
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
              temperature: 0.75,
              max_tokens: 140
            })
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            continue;
          }

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
