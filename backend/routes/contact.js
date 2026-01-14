// ----------------backend/routes/contact.js----------------

const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

const EMAIL_FOOTER = `
  <div style="margin-top:30px; background:#EDECC2; border-radius:28px; padding:18px; font-family: 'Doto', Arial, sans-serif; font-weight:700;">
    <div style="display:flex; align-items:center; gap:14px;">
      <img src="https://TU-DOMINIO.COM/public/img/Yellow%20Square%20Studio%20Logo%20with%20shadow.png"
           alt="Yellow Square Studio" width="120" style="display:block;">
      <div style="color:#000;">
        <div style="font-size:18px; margin-bottom:6px;">Yellow Square Studio</div>
        <div style="font-size:14px; line-height:1.4;">
          Estudio creativo que convierte ideas en marcas.<br/>
          Diseño, desarrollo y comunicación visual.
        </div>
        <div style="margin-top:10px; font-size:14px;">
          ✉️ <a href="mailto:go.yellowsquare@gmail.com" style="color:#000; text-decoration:none;">go.yellowsquare@gmail.com</a><br/>
          📞 <a href="tel:+34XXXXXXXXX" style="color:#000; text-decoration:none;">+34 XXX XXX XXX</a><br/>
          📷 <a href="https://instagram.com/yellow.square.studio" style="color:#000; text-decoration:none;">@yellow.square.studio</a>
        </div>
      </div>
    </div>
  </div>
`;

router.post("/", async (req, res) => {
  const { firstName, businessName, email, phone, message } = req.body;
// ✅ DEBUG: ver qué está llegando desde el frontend
  console.log("BODY:", req.body);
  if (!firstName || !businessName || !email || !phone || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false },
    });

    await transporter.verify();

    // email interno (a ti)
    await transporter.sendMail({
      from: `"Yellow Square Studio" <${process.env.SMTP_USER}>`,
      to: "go.yellowsquare@gmail.com",
      subject: "Nuevo mensaje desde el formulario de contacto",
      html: `
        <div style="font-family: Arial, sans-serif; color:#000;">
          <h2>Nuevo contacto desde la web</h2>
          <p><strong>Nombre:</strong> ${firstName}</p>
          <p><strong>Empresa:</strong> ${businessName}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensaje:</strong><br/>${message}</p>
          ${EMAIL_FOOTER}
        </div>
      `,
    });

    // confirmación al cliente
    await transporter.sendMail({
      from: `"Yellow Square Studio" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Gracias por contactar con Yellow Square Studio",
      html: `
        <div style="font-family: Arial, sans-serif; color:#000;">
          <p>Hola ${firstName},</p>
          <p>Hemos recibido tu mensaje y te contactaremos lo antes posible.</p>
          <p><strong>Tu mensaje:</strong><br/>${message}</p>
          <p>— Yellow Square Studio</p>
          ${EMAIL_FOOTER}
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


// este fracmento funcina pero no tiene el footer bonito
// const express = require("express");
// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const router = express.Router();

// router.post("/", async (req, res) => {
//   const { firstName, businessName, email, phone, message } = req.body;

//   if (!firstName || !businessName || !email || !phone || !message) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   const fullName = `${firstName} ${businessName}`;

//   try {
//     // Crear transporter con fallback para puerto (secure según puerto)
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT),
//       secure: Number(process.env.SMTP_PORT) === 465, // true para 465, false para 587
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//       // opcional: evitar rechazos estrictos de TLS en dev
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });

//     // Verificar transporte (útil para debug)
//     await transporter.verify();

//     // 1. Enviar a tu correo interno
//     await transporter.sendMail({
//       from: `"Yellow Square" <${process.env.SMTP_USER}>`,
//       to: "go.yellowsquare@gmail.com", // cambia cuando sea definitivo
//       subject: "Nuevo mensaje desde el formulario de contacto",
//       html: `
//         <p><strong>Nombre:</strong> ${fullName}</p>
//         <p><strong>Teléfono:</strong> ${phone}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Mensaje:</strong> ${message}</p>
//       `,
//     });

//     // 2. Confirmación al cliente
//     await transporter.sendMail({
//       from: `"Yellow Square" <${process.env.SMTP_USER}>`,
//       to: email,
//       subject: "Gracias por contactar con Yellow Square",
//       html: `
//         <p>Hola ${firstName},</p>
//         <p>Hemos recibido tu mensaje y te contactaremos lo antes posible.</p>
//         <p><strong>Tu mensaje:</strong> ${message}</p>
//         <p>Gracias por tu interés,</p>
//         <p><strong>Yellow Square Studio</strong></p>
//       `,
//     });

//     res.status(200).json({ message: "Message sent successfully." });
//   } catch (error) {
//     console.error("Contact route error:", error);
//     res.status(500).json({ message: "Failed to send message." });
//   }
// });

// module.exports = router;