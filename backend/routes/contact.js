// backend/routes/contact.js

const express = require("express");
const { Resend } = require("resend");

const router = express.Router();

// ================================
// ✅ PEGAR AQUÍ: HELPERS + EMAIL TEMPLATES
// (Esto es lo que preguntabas "dónde cojones se pega")
// ================================
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function nl2br(str = "") {
  return escapeHtml(str).replace(/\n/g, "<br/>");
}

function prettyService(code) {
  const map = {
    web: "Diseño / Desarrollo web",
    branding: "Branding / Identidad",
    "photo-video": "Fotografía / Vídeo",
    seo: "SEO",
    social: "Redes sociales",
    strategy: "Estrategia / Embudos",
    other: "Otro",
  };
  return map[code] || code || "—";
}

function prettyBudget(code) {
  const map = {
    lt500: "Menos de 500€",
    "500-1000": "500€ – 1.000€",
    "1000-2500": "1.000€ – 2.500€",
    "2500-5000": "2.500€ – 5.000€",
    gt5000: "Más de 5.000€",
    "": "No lo sé todavía",
  };
  return map[code ?? ""] || code || "No lo sé todavía";
}

function prettyTimeline(code) {
  const map = {
    asap: "Lo antes posible",
    "2-4weeks": "2–4 semanas",
    "1-2months": "1–2 meses",
    "3plus": "3+ meses",
    "": "Flexible",
  };
  return map[code ?? ""] || code || "Flexible";
}

function buildClientEmail({ firstName, service, budget, timeline, message }) {
  const name = escapeHtml(firstName || "");
  const serviceText = escapeHtml(prettyService(service));
  const budgetText = escapeHtml(prettyBudget(budget));
  const timelineText = escapeHtml(prettyTimeline(timeline));
  const msg = nl2br(message || "");

  const logoUrl =
    "https://yellowsquarestudio.es/public/img/Yellow%20Square%20Studio%20Logo%20with%20shadow.png";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f6f6;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Hemos recibido tu mensaje. Te responderemos lo antes posible.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e9e9e9;">
            
            <tr>
              <td style="padding:22px 22px 14px 22px;background:#111111;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <img src="${logoUrl}" width="130" alt="Yellow Square Studio" style="display:block;border:0;outline:none;text-decoration:none;">
                    </td>
                    <td style="vertical-align:middle;text-align:right;font-family:Arial, sans-serif;color:#f4e67e;font-weight:800;font-size:14px;">
                      Yellow Square Studio
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:22px;font-family:Arial, sans-serif;color:#111111;">
                <h1 style="margin:0 0 10px 0;font-size:20px;line-height:1.3;">Hemos recibido tu mensaje ✅</h1>
                <p style="margin:0 0 14px 0;font-size:14px;line-height:1.6;">
                  Hola <strong>${name}</strong>,<br/>
                  Gracias por contactar con <strong>Yellow Square Studio</strong>. Te responderemos lo antes posible.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #eeeeee;border-radius:14px;">
                  <tr>
                    <td style="padding:14px 16px;font-size:14px;line-height:1.6;">
                      <div style="margin:0 0 6px 0;"><strong>Servicio:</strong> ${serviceText}</div>
                      <div style="margin:0 0 6px 0;"><strong>Presupuesto:</strong> ${budgetText}</div>
                      <div style="margin:0;"><strong>Timeline:</strong> ${timelineText}</div>
                    </td>
                  </tr>
                </table>

                <h2 style="margin:18px 0 8px 0;font-size:14px;">Tu mensaje</h2>
                <div style="font-size:14px;line-height:1.6;background:#ffffff;border-left:4px solid #f4e67e;padding:10px 12px;border-radius:10px;">
                  ${msg}
                </div>

                <div style="margin-top:18px;">
                  <a href="https://yellowsquarestudio.es" 
                     style="display:inline-block;background:#111111;color:#f4e67e;text-decoration:none;padding:10px 14px;border-radius:12px;font-size:14px;font-weight:800;">
                    Ver la web
                  </a>
                </div>

                <p style="margin:18px 0 0 0;font-size:12px;line-height:1.6;color:#666;">
                  — Yellow Square Studio<br/>
                  <a href="mailto:contact@yellowsquarestudio.es" style="color:#666;text-decoration:none;">contact@yellowsquarestudio.es</a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 22px;background:#f6f6f6;font-family:Arial, sans-serif;color:#777;font-size:11px;line-height:1.5;">
                Este email es automático para confirmar que hemos recibido tu mensaje.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildInternalEmail(payload) {
  const {
    firstName,
    businessName,
    email,
    phone,
    service,
    budget,
    timeline,
    rgpd,
    message,
  } = payload;

  const logoUrl =
    "https://yellowsquarestudio.es/public/img/Yellow%20Square%20Studio%20Logo%20with%20shadow.png";

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f6f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:24px 0;">
<tr><td align="center">
  <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="width:680px;max-width:680px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e9e9e9;">
    <tr>
      <td style="padding:18px 22px;background:#111111;">
        <img src="${logoUrl}" width="130" alt="Yellow Square Studio" style="display:block;border:0;">
      </td>
    </tr>
    <tr>
      <td style="padding:20px 22px;font-family:Arial, sans-serif;color:#111;">
        <h2 style="margin:0 0 10px 0;">Nuevo lead desde la web</h2>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #eee;border-radius:14px;">
          <tr><td style="padding:14px 16px;font-size:14px;line-height:1.7;">
            <div><strong>Nombre:</strong> ${escapeHtml(firstName)} </div>
            <div><strong>Empresa/Proyecto:</strong> ${escapeHtml(businessName)} </div>
            <div><strong>Tel:</strong> ${escapeHtml(phone)} </div>
            <div><strong>Email:</strong> ${escapeHtml(email)} </div>
            <hr style="border:none;border-top:1px solid #e6e6e6;margin:12px 0;">
            <div><strong>Servicio:</strong> ${escapeHtml(prettyService(service))}</div>
            <div><strong>Presupuesto:</strong> ${escapeHtml(prettyBudget(budget))}</div>
            <div><strong>Timeline:</strong> ${escapeHtml(prettyTimeline(timeline))}</div>
            <div><strong>RGPD:</strong> ${rgpd ? "Sí" : "No"}</div>
          </td></tr>
        </table>

        <h3 style="margin:16px 0 8px 0;font-size:14px;">Mensaje</h3>
        <div style="font-size:14px;line-height:1.6;border-left:4px solid #f4e67e;background:#fff;padding:10px 12px;border-radius:10px;">
          ${nl2br(message)}
        </div>
      </td>
    </tr>
  </table>
</td></tr></table>
</body></html>`;
}

// ================================
// ✅ RESEND SEND
// ================================
async function sendWithResend({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  if (!from) throw new Error("Missing RESEND_FROM");

  const resend = new Resend(apiKey);

  const sendPayload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };

  if (replyTo) sendPayload.reply_to = replyTo;

  const { error } = await resend.emails.send(sendPayload);
  if (error) throw new Error(`Resend API error: ${JSON.stringify(error)}`);
}

// ================================
// ✅ ROUTE
// ================================
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

  if (!firstName || !businessName || !email || !phone || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (!service) {
    return res.status(400).json({ message: "Service is required." });
  }
  if (!rgpd) {
    return res.status(400).json({ message: "RGPD consent is required." });
  }

  try {
    // 1) Email interno (a tu bandeja)
    const internalTo = process.env.CONTACT_TO || "contact@yellowsquarestudio.es";

    await sendWithResend({
      to: internalTo,
      subject: "Nuevo mensaje desde el formulario (YSS)",
      html: buildInternalEmail({
        firstName,
        businessName,
        email,
        phone,
        service,
        budget,
        timeline,
        rgpd,
        message,
      }),
      replyTo: email, // para que puedas responder directo al lead
    });

    // 2) Auto-respuesta al cliente
    await sendWithResend({
      to: email,
      subject: "Hemos recibido tu mensaje ✅",
      html: buildClientEmail({
        firstName,
        service,
        budget,
        timeline,
        message,
      }),
    });

    return res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Contact route error:", error);
    return res.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;