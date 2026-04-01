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
      return res.status(500).json({ error: "Missing AI_API_KEY." });
    }

    // 🔥 List of free models to try (order matters)
    const models = [
      "stepfun/step-3.5-flash:free",
      "google/gemma-3n-e4b-it:free"
    ];

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
              {
                role: "system",
                content: "You are Beloved Bot. The user is Angel. Be warm, natural, sweet, playful, and human. Never say you are an AI."
              },
              {
                role: "user",
                content: String(message).trim()
              }
            ],
            temperature: 0.9,
            max_tokens: 180
          })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data?.choices?.[0]?.message?.content) {
          return res.status(200).json({
            reply: data.choices[0].message.content.trim()
          });
        }

      } catch (err) {
        // try next model
      }
    }

    return res.status(500).json({
      error: "All free AI models are currently unavailable. Try again in a moment."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error"
    });
  }
}            role: "system",
            content: "You are Beloved Bot. The user is Angel. Reply warmly, naturally, sweetly, and like a real person. Be romantic but clean. Never say you are an AI."
          },
          {
            role: "user",
            content: String(message).trim()
          }
        ],
        temperature: 0.9,
        max_tokens: 180
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || data?.message || JSON.stringify(data) || "Provider returned error"
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: JSON.stringify(data) || "No reply from AI."
      });
    }

    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}            content: String(message).trim()
          }
        ],
        temperature: 0.9,
        max_tokens: 180
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || data?.message || JSON.stringify(data) || "Provider returned error"
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: JSON.stringify(data) || "No reply from AI."
      });
    }

    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
