// server.js (CommonJS)
// Requisitos: npm i express cors dotenv node-fetch@2

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuración CORS ---
// Puedes restringir a tu dominio de Hostinger si quieres:
// const ALLOWED_ORIGINS = ["https://gold-snail-248674.hostingersite.com"];
// app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(cors()); // abierto (útil para pruebas)

app.use(express.json());

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gemini-backend" });
});

// Endpoint principal
app.post("/api/gemini", async (req, res) => {
  try {
    const { message, context = "" } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Falta 'message' (string) en el body." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta configurar GEMINI_API_KEY en variables de entorno." });
    }

    // Prompt combinado con contexto opcional
    const prompt = `
Responde de forma clara y útil. Usa el contexto sólo si ayuda.

Contexto:
${context}

Pregunta del usuario:
${message}
    `.trim();

    // Llamada a la API de Gemini (modelo de texto)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await geminiRes.json();

    // Intenta extraer el texto de la respuesta
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ||
      null;

    if (!text) {
      // Log para depurar en Render (no se envía al cliente)
      console.error("Respuesta inesperada de Gemini:", JSON.stringify(data, null, 2));
      return res.status(502).json({ error: "No pude generar la respuesta (Gemini sin texto)." });
    }

    return res.json({ response: text });
  } catch (err) {
    console.error("Error /api/gemini:", err);
    return res.status(500).json({ error: "Error interno al consultar Gemini." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
