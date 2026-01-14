// ----------------frontend/js/contact.js----------------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const feedback = document.getElementById("formFeedback");

  const submitBtn = document.getElementById("contact-submit");
  const btnText = submitBtn?.querySelector(".btn-text");
  const spinner = submitBtn?.querySelector("svg");

  if (!form || !feedback || !submitBtn || !btnText || !spinner) return;

  // ✅ 1) API_BASE definido ANTES de usarlo (y SOLO depende de si es local)
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const API_BASE = isLocal
    ? "http://localhost:10000"
    : "https://yss-v2.onrender.com";

  console.log("HOST:", window.location.hostname);
  console.log("API_BASE:", API_BASE);

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
    const payload = {
      firstName: (formData.get("firstName") || "").toString().trim(),
      businessName: (formData.get("businessName") || "").toString().trim(),
      phone: (formData.get("phone") || "").toString().trim(),
      email: (formData.get("email") || "").toString().trim(),
      message: (formData.get("message") || "").toString().trim(),
    };

    if (!payload.firstName || !payload.businessName || !payload.phone || !payload.email || !payload.message) {
      setFeedback("Rellena todos los campos.", false);
      return;
    }
    if (!payload.email.includes("@")) {
      setFeedback("Pon un correo válido.", false);
      return;
    }

    setFeedback("", true);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let resultMsg = "";
      try {
        const data = await res.json();
        resultMsg = data?.message || "";
      } catch {
        resultMsg = await res.text();
      }

      if (res.ok) {
        setFeedback(resultMsg || "Mensaje enviado correctamente.", true);
        form.reset();
      } else {
        setFeedback(resultMsg || "Error al enviar el mensaje.", false);
      }
    } catch (err) {
      console.error(err);
      setFeedback("Error de conexión. Intenta de nuevo.", false);
    } finally {
      setLoading(false);
    }
  });
});