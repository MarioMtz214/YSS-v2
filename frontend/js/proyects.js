// frontend/js/proyects.js

document.addEventListener("DOMContentLoaded", () => {
  const projectCards = document.querySelectorAll(".project-card");

  projectCards.forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return; // Ignorar clicks en links
      const image = card.dataset.images ? card.dataset.images.split(",")[0].trim() : "";
      const title = card.querySelector("h2").innerText;
      const description = card.querySelector("p").innerText;
      showPopup({ image, title, description });
    });
  });
});

function showPopup(project) {
  // Overlay fijo
  const popup = document.createElement("div");
  popup.id = "popup-container";
  popup.className = "fixed inset-0 w-scree h-screen flex justify-center items-center bg-black bg-opacity-80";

  // Contenedor central con shadow Tailwind
  const container = document.createElement("div");
  container.className = "lg:max-w-[70%] w-[90%] bg-black pb-10 lg:rounded-3xl rounded-3xl text-end shadow-2xl shadow-zinc-600 relative";

  // Botón de cerrar ovalado
  const closeWrapper = document.createElement("div");
  closeWrapper.className = "absolute top-8 right-8 mt-1 mr-1 bg-black text-white rounded-full p-2 w-16 h-8 flex items-center justify-center shadow-2xl shadow-zinc-600";

  const closeBtn = document.createElement("button");
  closeBtn.id = "close-btn";
  closeBtn.className = "hover:text-black hover:bg-yellow-200 rounded-full w-10 h-6 flex items-center justify-center font-black";
  closeBtn.innerText = "x";
  closeBtn.addEventListener("click", () => popup.remove());

  closeWrapper.appendChild(closeBtn);
  container.appendChild(closeWrapper);

  // Imagen 
  const img = document.createElement("img");
  img.src = project.image;
  img.alt = project.title;
  img.className = "lg:max-h-[70vh] w-auto mx-auto mb-4 lg:rounded-3xl rounded-3xl";
  container.appendChild(img);

  // Título
  const titleEl = document.createElement("h2");
  titleEl.className = "text-YSS1 pr-4 lg:text-2xl text-xl font-bold";
  titleEl.innerText = project.title;
  container.appendChild(titleEl);

  // Descripción
  const descEl = document.createElement("p");
  descEl.className = "text-zinc-300 pr-4 lg:text-xl text-lg";
  descEl.innerText = project.description;
  container.appendChild(descEl);

  popup.appendChild(container);
  document.body.appendChild(popup);

  // Cerrar al clicar fuera del popup
  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.remove();
  });
}

