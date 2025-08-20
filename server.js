// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // permite peticiones desde cualquier origen
app.use(bodyParser.json());

// Configura Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Ruta principal de prueba
app.get("/", (req, res) => {
  res.send("Servidor de Gemini activo");
});

// Ruta para el frontend: /api/gemini
app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Falta el prompt" });
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ respuesta: text });
  } catch (error) {
    console.error("Error al generar contenido:", error);
    res.status(500).json({ error: "Error al generar respuesta con Gemini" });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
