// server.js (CommonJS)
// npm i express cors dotenv @google/generative-ai

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ⚠️ Asegúrate de tener GEMINI_API_KEY en Render (Environment Variables)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Modelos válidos: "gemini-1.5-flash", "gemini-1.5-pro"
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get("/health", (_req, res) => res.json({ ok: true, service: "gemini-backend" }));

app.post("/api/gemini", async (req, res) => {
  try {
    const { message, context = "" } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Falta 'message' (string) en el body." });
    }

    const prompt = `Responde de forma clara y útil. Usa el contexto sólo si ayuda.

Contexto:
${context}

Pregunta del usuario:
${message}`;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.();

    if (!text) {
      return res.status(502).json({ error: "No pude generar la respuesta (Gemini sin texto)." });
    }
    res.json({ response: text });
  } catch (err) {
    // Devuelve algo útil para depurar rápido
    console.error("Error /api/gemini:", err?.response?.data || err);
    res.status(500).json({ error: "Error interno al consultar Gemini." });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
