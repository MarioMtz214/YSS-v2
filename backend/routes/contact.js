// ----------------backend/routes/contact.js----------------

// const express = require("express");
// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const router = express.Router();

// const EMAIL_FOOTER = `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
//     <tr>
//       <td style="background:#EDECC2;border-radius:22px;padding:16px;font-family:Arial, sans-serif;font-weight:700;color:#000;">
//         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//           <tr>
//             <td style="vertical-align:middle;width:140px;padding-right:12px;">
//               <img src="https://yellowsquarestudio.es/public/img/Yellow%20Square%20Studio%20Logo%20with%20shadow.png"
//                    alt="Yellow Square Studio" width="120" style="display:block;border:0;outline:none;text-decoration:none;">
//             </td>
//             <td style="vertical-align:middle;">
//               <div style="font-size:16px;margin:0 0 6px 0;">Yellow Square Studio</div>
//               <div style="font-size:13px;line-height:1.4;">
//                 Estudio creativo que convierte ideas en marcas.<br>
//                 Diseño, desarrollo y comunicación visual.
//               </div>

//               <div style="margin-top:10px;font-size:13px;line-height:1.6;">
//                 ✉️ <a href="mailto:go.yellowsquare@gmail.com" style="color:#000;text-decoration:none;">go.yellowsquare@gmail.com</a><br>
//                 📷 <a href="https://instagram.com/yellow.square.studio" style="color:#000;text-decoration:none;">@yellow.square.studio</a>
//               </div>
//             </td>
//           </tr>
//         </table>
//         <div style="margin-top:10px;font-size:12px;opacity:.75;">© 2026 Yellow Square Studio. Todos los derechos reservados.</div>
//       </td>
//     </tr>
//   </table>
// `;

// router.post("/", async (req, res) => {
//   console.log("BODY:", req.body);

//   const { firstName, businessName, email, phone, message } = req.body || {};

//   if (!firstName || !businessName || !email || !phone || !message) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT), // 587
//       secure: false, // <-- importante
//       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//       tls: { rejectUnauthorized: false },
//     });

//     await transporter.verify();

//     // Email interno
//     await transporter.sendMail({
//       from: `"Yellow Square Studio" <${process.env.SMTP_USER}>`,
//       to: "go.yellowsquare@gmail.com",
//       subject: "Nuevo mensaje desde el formulario de contacto",
//       html: `
//         <div style="font-family:Arial, sans-serif;color:#000;">
//           <h2 style="margin:0 0 12px 0;">Nuevo contacto desde la web</h2>
//           <p><strong>Nombre:</strong> ${firstName}</p>
//           <p><strong>Empresa:</strong> ${businessName}</p>
//           <p><strong>Teléfono:</strong> ${phone}</p>
//           <p><strong>Email:</strong> ${email}</p>
//           <p><strong>Mensaje:</strong><br>${message}</p>
//           ${EMAIL_FOOTER}
//         </div>
//       `,
//     });

//     // Confirmación al cliente
//     await transporter.sendMail({
//       from: `"Yellow Square Studio" <${process.env.SMTP_USER}>`,
//       to: email,
//       subject: "Gracias por contactar con Yellow Square Studio",
//       html: `
//         <div style="font-family:Arial, sans-serif;color:#000;">
//           <p>Hola ${firstName},</p>
//           <p>Hemos recibido tu mensaje y te contactaremos lo antes posible.</p>
//           <p><strong>Tu mensaje:</strong><br>${message}</p>
//           <p style="margin-top:14px;">— Yellow Square Studio</p>
//           ${EMAIL_FOOTER}
//         </div>
//       `,
//     });

//     return res.status(200).json({ message: "Message sent successfully." });
//   } catch (error) {
//     console.error("Contact route error:", error);
//     return res.status(500).json({ message: "Failed to send message." });
//   }
// });

// module.exports = router;


// este fracmento funcina pero no tiene el footer bonito
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