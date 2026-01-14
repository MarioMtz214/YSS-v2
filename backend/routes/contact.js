// ----------------backend/routes/contact.js----------------

const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { firstName, businessName, email, phone, message } = req.body;

  if (!firstName || !businessName || !email || !phone || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const fullName = `${firstName} ${businessName}`;

  try {
    // Crear transporter con fallback para puerto (secure según puerto)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true para 465, false para 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // opcional: evitar rechazos estrictos de TLS en dev
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verificar transporte (útil para debug)
    await transporter.verify();

    // 1. Enviar a tu correo interno
    await transporter.sendMail({
      from: `"Yellow Square" <${process.env.SMTP_USER}>`,
      to: "go.yellowsquare@gmail.com", // cambia cuando sea definitivo
      subject: "Nuevo mensaje desde el formulario de contacto",
      html: `
        <p><strong>Nombre:</strong> ${fullName}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong> ${message}</p>
      `,
    });

    // 2. Confirmación al cliente
    await transporter.sendMail({
      from: `"Yellow Square" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Gracias por contactar con Yellow Square",
      html: `
        <p>Hola ${firstName},</p>
        <p>Hemos recibido tu mensaje y te contactaremos lo antes posible.</p>
        <p><strong>Tu mensaje:</strong> ${message}</p>
        <p>Gracias por tu interés,</p>
        <p><strong>Yellow Square Studio</strong></p>
      `,
    });

    res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Contact route error:", error);
    res.status(500).json({ message: "Failed to send message." });
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