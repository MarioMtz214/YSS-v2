// ----------------backend/routes/contact.js----------------

const express = require("express");
const router = express.Router();

const EMAIL_FOOTER = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
    <tr>
      <td style="background:#EDECC2;border-radius:22px;padding:16px;font-family:Arial, sans-serif;font-weight:700;color:#000;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;width:140px;padding-right:12px;">
              <img src="https://yellowsquarestudio.es/public/img/Yellow%20Square%20Studio%20Logo%20with%20shadow.png"
                   alt="Yellow Square Studio" width="120" style="display:block;border:0;outline:none;text-decoration:none;">
            </td>
            <td style="vertical-align:middle;">
              <div style="font-size:16px;margin:0 0 6px 0;">Yellow Square Studio</div>
              <div style="font-size:13px;line-height:1.4;">
                Estudio creativo que convierte ideas en marcas.<br>
                Diseño, desarrollo y comunicación visual.
              </div>

              <div style="margin-top:10px;font-size:13px;line-height:1.6;">
                ✉️ <a href="mailto:contact@yellowsquarestudio.es" style="color:#000;text-decoration:none;">contact@yellowsquarestudio.es</a><br>
                📷 <a href="https://instagram.com/yellow.square.studio" style="color:#000;text-decoration:none;">@yellow.square.studio</a>
              </div>
            </td>
          </tr>
        </table>
        <div style="margin-top:10px;font-size:12px;opacity:.75;">© 2026 Yellow Square Studio.</div>
      </td>
    </tr>
  </table>
`;

async function sendWithResend({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) throw new Error("Missing RESEND_API_KEY or RESEND_FROM");

  const payload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };

  if (replyTo) payload.reply_to = replyTo; // Resend usa reply_to

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Resend API error: ${r.status} ${text}`);
  }
  return r.json();
}

router.post("/", async (req, res) => {
  const {
    firstName,
    businessName,
    email,
    phone,
    message,
    service,
    budget,
    timeline,
    rgpd,
  } = req.body || {};

  // Logs útiles (sin enseñar datos sensibles)
  console.log("CONTACT BODY KEYS:", Object.keys(req.body || {}));
  console.log("CONTACT BODY:", {
    firstName,
    businessName,
    email,
    phone,
    service,
    budget,
    timeline,
    rgpd,
    messageLen: message?.length || 0,
  });

  if (!firstName || !businessName || !email || !phone || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (!service) return res.status(400).json({ message: "Service is required." });
  if (!rgpd) return res.status(400).json({ message: "RGPD consent is required." });

  const internalTo = process.env.CONTACT_TO || "contact@yellowsquarestudio.es";

  try {
    // 1) Email interno
    await sendWithResend({
      to: internalTo,
      subject: "Nuevo mensaje desde el formulario de contacto",
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; color:#000;">
          <h2 style="margin:0 0 12px 0;">Nuevo contacto desde la web</h2>

          <p><strong>Nombre:</strong> ${firstName}</p>
          <p><strong>Empresa / Proyecto:</strong> ${businessName}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>

          <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;" />

          <p><strong>Servicio:</strong> ${service}</p>
          <p><strong>Presupuesto:</strong> ${budget || "No lo sé todavía"}</p>
          <p><strong>Timeline:</strong> ${timeline || "Flexible"}</p>
          <p><strong>RGPD:</strong> ${rgpd ? "Aceptado" : "No"}</p>

          <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;" />

          <p><strong>Mensaje:</strong><br/>${String(message).replace(/\n/g, "<br/>")}</p>

          ${EMAIL_FOOTER}
        </div>
      `,
    });

    // 2) Auto-respuesta (opcional, pero útil)
    await sendWithResend({
      to: email,
      subject: "Hemos recibido tu mensaje ✅",
      html: `
        <div style="font-family: Arial, sans-serif; color:#000;">
          <p>Hola ${firstName},</p>
          <p>Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos lo antes posible.</p>

          <p style="margin-top:14px;"><strong>Resumen:</strong></p>
          <ul>
            <li><strong>Servicio:</strong> ${service}</li>
            <li><strong>Presupuesto:</strong> ${budget || "No lo sé todavía"}</li>
            <li><strong>Timeline:</strong> ${timeline || "Flexible"}</li>
          </ul>

          <p style="margin-top:14px;"><strong>Tu mensaje:</strong><br/>${String(message).replace(/\n/g, "<br/>")}</p>

          <p style="margin-top:16px;">— Yellow Square Studio</p>
          ${EMAIL_FOOTER}
        </div>
      `,
    });

    return res.status(200).json({ message: "Message sent successfully." });
  } catch (err) {
    console.error("Contact route error:", err);
    return res.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;