// ====================================================================
// VARIABLES GLOBALES
// ====================================================================
let mobileMenuOpen = false;
let scrollPos = 0;

// ====================================================================
// F A D E – I N   (bloqueado cuando el menú móvil está abierto)
// ====================================================================
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !mobileMenuOpen) {
        // si el menú móvil está abierto, NO animamos
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  elements.forEach(el => observer.observe(el));
});

// ====================================================================
// SCROLL LOCK PARA SAFARI iOS
// ====================================================================
function lockScroll() {
  scrollPos = window.scrollY || 0;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollPos}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function unlockScroll() {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, scrollPos);
}

// ====================================================================
// NAV TOGGLE
// ====================================================================
document.addEventListener("DOMContentLoaded", () => {

  // NUEVOS IDs
  const navClosedDesktop = document.getElementById("desktop-menu-toggle");
  const navClosedMobile  = document.getElementById("mobile-menu-toggle");

  const navOpened = document.getElementById("nav-opened");

  const mobileNav = document.getElementById("mobile-nav");
  const closeDesk = document.getElementById("close-btn");
  const closeMobile = document.getElementById("close-btn-sm-nav");
  const closeMobileWrapper = document.getElementById("close-btn-sm-wrapper");

  let scrollPos = 0;

  // ============= SCROLL LOCK (Safari-safe) =============
  function lockScroll() {
    scrollPos = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPos}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollPos);
  }

  // ============= ABRIR MENÚ DESKTOP =============
  navClosedDesktop?.addEventListener("click", () => {
    navOpened.classList.remove("nav-collapsed", "opacity-0", "pointer-events-none");
    navOpened.classList.add("nav-expanded");
    navClosedDesktop.classList.add("hidden");
  });

  // ============= CERRAR MENÚ DESKTOP =============
  closeDesk?.addEventListener("click", () => {
    navOpened.classList.remove("nav-expanded");
    navOpened.classList.add("nav-collapsed", "opacity-0", "pointer-events-none");
    navClosedDesktop.classList.remove("hidden");
  });

  // ============= ABRIR MENÚ MÓVIL =============
  navClosedMobile?.addEventListener("click", () => {
    mobileNav.classList.remove("hidden");
    navClosedMobile.classList.add("hidden");

    if (closeMobileWrapper) {
      closeMobileWrapper.classList.remove("hidden");
    }

    lockScroll();
  });

  // ============= CERRAR MENÚ MÓVIL =============
  closeMobile?.addEventListener("click", () => {
    mobileNav.classList.add("hidden");
    navClosedMobile.classList.remove("hidden");

    if (closeMobileWrapper) {
      closeMobileWrapper.classList.add("hidden");
    }

    unlockScroll();
  });

  // ============= RESIZE =============
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      mobileNav.classList.add("hidden");
      if (closeMobileWrapper) closeMobileWrapper.classList.add("hidden");
      navClosedMobile.classList.remove("hidden");

      unlockScroll();
    }
  });
});

// ====================================================================
// SMOOTH SCROLL (desactivado si el menú móvil está abierto)
// ====================================================================
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      // NO smooth scroll si está el menú móvil (Safari FIX)
      if (mobileMenuOpen) return;

      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ====================================================================
  // FORMULARIO (TAL CUAL LO TENÍAS)
  // ====================================================================
  const form = document.getElementById("contactForm");
  const feedback = document.getElementById("formFeedback");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      feedback.textContent = "";
      feedback.classList.remove("text-red-500", "text-green-500");

      const formData = new FormData(form);
      const payload = {
        firstName: formData.get("firstName") || "",
        lastName: formData.get("businessName") || "",
        email: formData.get("email") || "",
        phone: formData.get("phone") || "",
        message: formData.get("message") || "",
      };

      if (!payload.email.includes("@")) {
        feedback.textContent = "Pon un correo válido.";
        feedback.classList.add("text-red-500");
        return;
      }
      if (!payload.firstName || !payload.lastName || !payload.phone || !payload.message) {
        feedback.textContent = "Rellena todos los campos.";
        feedback.classList.add("text-red-500");
        return;
      }

      try {
        const res = await fetch(
          "https://yellow-square-backend.onrender.com/api/contact",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        let resultText = "";
        try {
          const parsed = await res.json();
          resultText = parsed.message || "";
        } catch {
          resultText = await res.text();
        }

        if (res.ok) {
          feedback.textContent = resultText || "Enviado correctamente.";
          feedback.classList.add("text-[#FFFBB0]", "text-bold");
          form.reset();
          setTimeout(closeModal, 1500);
        } else {
          feedback.textContent = resultText || "Error al enviar.";
          feedback.classList.add("text-red-500", "text-bold");
        }
      } catch (err) {
        console.error(err);
        feedback.textContent = "Error de conexión.";
        feedback.classList.add("text-red-500", "text-bold");
      }
    });
  }
});