// ----------------backend/routes/contact.js----------------

const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("CONTACT BODY KEYS:", Object.keys(req.body || {}));
  console.log("CONTACT BODY:", {
    firstName: req.body?.firstName,
    businessName: req.body?.businessName,
    email: req.body?.email,
    phone: req.body?.phone,
    service: req.body?.service,
    budget: req.body?.budget,
    timeline: req.body?.timeline,
    rgpd: req.body?.rgpd,
    messageLen: (req.body?.message || "").length,
  });

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

  // required básicos
  if (!firstName || !businessName || !email || !phone || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // nuevos required reales
  if (!service) {
    return res.status(400).json({ message: "Service is required." });
  }
  if (!rgpd) {
    return res.status(400).json({ message: "RGPD consent is required." });
  }

  const fullName = `${firstName} ${businessName}`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      // Hostinger suele ir bien sin tocar tls, pero lo dejamos por si acaso:
      tls: { rejectUnauthorized: false },

      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
    });

    await transporter.verify();

    const internalTo = process.env.CONTACT_TO || process.env.SMTP_USER;

    // 1) Interno
    await transporter.sendMail({
      from: `"Yellow Square Studio" <${process.env.SMTP_USER}>`,
      to: internalTo,
      replyTo: email,
      subject: "Nuevo mensaje desde el formulario de contacto",
      html: `
        <div style="font-family: Arial, sans-serif; color:#000;">
          <h2>Nuevo contacto desde la web</h2>

          <p><strong>Nombre / Empresa:</strong> ${fullName}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>

          <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;" />

          <p><strong>Servicio:</strong> ${service}</p>
          <p><strong>Presupuesto:</strong> ${budget || "No indicado"}</p>
          <p><strong>Timeline:</strong> ${timeline || "Flexible"}</p>
          <p><strong>RGPD:</strong> ${rgpd ? "Aceptado" : "No"}</p>

          <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;" />

          <p><strong>Mensaje:</strong><br/>${String(message).replace(/\n/g, "<br/>")}</p>
        </div>
      `,
    });

    // 2) Auto-respuesta al cliente (simple)
    await transporter.sendMail({
      from: `"Yellow Square Studio" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Hemos recibido tu mensaje ✅",
      html: `
        <div style="font-family: Arial, sans-serif; color:#000;">
          <p>Hola ${firstName},</p>
          <p>Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos lo antes posible.</p>

          <p style="margin-top:14px;"><strong>Resumen:</strong></p>
          <ul>
            <li><strong>Servicio:</strong> ${service}</li>
            <li><strong>Presupuesto:</strong> ${budget || "No indicado"}</li>
            <li><strong>Timeline:</strong> ${timeline || "Flexible"}</li>
          </ul>

          <p style="margin-top:14px;"><strong>Tu mensaje:</strong><br/>${String(message).replace(/\n/g, "<br/>")}</p>

          <p style="margin-top:16px;">— Yellow Square Studio</p>
        </div>
      `,
    });

    return res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Contact route error:", error);
    return res.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;