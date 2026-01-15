// ----------------frontend/js/contact.js----------------

document.addEventListener("DOMContentLoaded", () => {
  console.log("CONTACT.JS VERSION 👉 2026-01-15-01");

  const form = document.getElementById("contactForm");
  const feedback = document.getElementById("formFeedback");
  const submitBtn = document.getElementById("contact-submit");
  const btnText = submitBtn?.querySelector(".btn-text");
  const spinner = submitBtn?.querySelector("svg");

  if (!form || !feedback || !submitBtn || !btnText || !spinner) return;

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const API_BASE = isLocal
    ? "http://localhost:10000"
    : "https://yss-v2.onrender.com";

  const setLoading = (isLoading) => {
    submitBtn.disabled = isLoading;
    spinner.classList.toggle("hidden", !isLoading);
    btnText.textContent = isLoading ? "Enviando..." : "Enviar";
  };

  const setFeedback = (msg, ok) => {
    feedback.textContent = msg;
    feedback.classList.remove("text-red-500", "text-green-500");
    feedback.classList.add(ok ? "text-green-500" : "text-red-500");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // normaliza
    payload.firstName = (payload.firstName || "").toString().trim();
    payload.businessName = (payload.businessName || "").toString().trim();
    payload.phone = (payload.phone || "").toString().trim();
    payload.email = (payload.email || "").toString().trim();
    payload.message = (payload.message || "").toString().trim();
    payload.service = (payload.service || "").toString().trim();
    payload.budget = (payload.budget || "").toString().trim();
    payload.timeline = (payload.timeline || "").toString().trim();
    payload.rgpd = formData.get("rgpd") ? true : false;

    console.log("PAYLOAD SENT ✅", payload);

    if (!payload.firstName || !payload.businessName || !payload.phone || !payload.email || !payload.message) {
      setFeedback("Rellena todos los campos.", false);
      return;
    }
    if (!payload.email.includes("@")) {
      setFeedback("Pon un correo válido.", false);
      return;
    }
    if (!payload.service) {
      setFeedback("Selecciona qué necesitas.", false);
      return;
    }
    if (!payload.rgpd) {
      setFeedback("Debes aceptar la política (RGPD).", false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(async () => ({ message: await res.text() }));

      if (res.ok) {
        setFeedback(data.message || "Mensaje enviado correctamente.", true);
        form.reset();
      } else {
        setFeedback(data.message || "Error al enviar el mensaje.", false);
      }
    } catch (err) {
      console.error(err);
      setFeedback("Error de conexión. Intenta de nuevo.", false);
    } finally {
      setLoading(false);
    }
  });
});