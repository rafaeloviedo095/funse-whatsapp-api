import express from "express";

const app = express();

// Para leer JSON del body
app.use(express.json());

// 🔐 Token para verificar el webhook (debe ser igual al que pusiste en Meta)
const VERIFY_TOKEN = "FUNSE_VERIFY_TOKEN_123";

// 🔐 Credenciales de WhatsApp Cloud API
// Estos valores los vamos a poner como variables de entorno en Vercel
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";

// 👉 Función para enviar un mensaje de texto por WhatsApp
async function sendWhatsAppText(to: string, body: string) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error("Faltan WHATSAPP_TOKEN o PHONE_NUMBER_ID");
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  const data = await res.json();
  console.log("Respuesta de WhatsApp:", JSON.stringify(data, null, 2));
}

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

// 📩 RECEPCIÓN DE MENSAJES (POST) – AQUÍ ESTÁ EL BOT BÁSICO
app.post("/webhook", async (req, res) => {
  console.log("📩 Evento recibido de WhatsApp:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    const msg = messages?.[0];

    if (msg && msg.type === "text") {
      const from = msg.from;              // número del usuario
      const text = msg.text?.body || "";  // mensaje que escribió

      console.log("👤 De:", from);
      console.log("💬 Texto:", text);

      // 🤖 BOT BÁSICO: responder siempre que alguien escriba
      await sendWhatsAppText(
        from,
        `Hola 👋, gracias por escribir a FUNSE.\n\nRecibimos tu mensaje: "${text}".`
      );
    }
  } catch (err) {
    console.error("⚠️ Error procesando el mensaje:", err);
  }

  // WhatsApp siempre espera 200
  return res.sendStatus(200);
});

export default app;
