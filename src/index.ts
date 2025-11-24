import express from "express";

const app = express();

// Middleware para leer JSON del body
app.use(express.json());

// 🔐 Token que vas a usar en Meta > Webhooks
const VERIFY_TOKEN = "FUNSE_VERIFY_TOKEN_123";

// Ruta simple para probar que el servidor funciona
app.get("/", (req, res) => {
  res.send("FUNSE WhatsApp API funcionando ✅");
});

// ✅ VERIFICACIÓN DEL WEBHOOK (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado correctamente");
    return res.status(200).send(challenge);
  } else {
    console.log("❌ Error verificando webhook");
    return res.sendStatus(403);
  }
});

// 📩 RECEPCIÓN DE MENSAJES (POST)
app.post("/webhook", (req, res) => {
  console.log("📩 Evento recibido de WhatsApp:");
  console.log(JSON.stringify(req.body, null, 2));

  // Aquí luego podrás procesar el mensaje y responder

  return res.sendStatus(200);
});

export default app;
