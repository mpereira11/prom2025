let invitados = [];

// cargar JSON (asegúrate de la ruta correcta)
fetch("./invitados.json")
  .then(res => res.json())
  .then(data => {
    invitados = data;
  })
  .catch(err => console.error("Error cargando JSON:", err));

/**
 * Normaliza texto:
 * - minúsculas
 * - elimina tildes
 * - elimina caracteres que no sean letras/números/espacios (quita puntos, comas, paréntesis, etc.)
 * - compacta espacios
 */
function normalizar(texto) {
  if (!texto) return "";
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")    // quita tildes
    .replace(/[^\w\s]/g, "")            // quita puntuación (incluye puntos de iniciales)
    .replace(/\s+/g, " ")               // compacta espacios
    .trim();
}

function searchGuest() {
  const input = normalizar(document.getElementById("searchInput").value);
  const resultDiv = document.getElementById("result");
  const suggestionsList = document.getElementById("suggestions");

  // Limpiar resultado
  resultDiv.textContent = "";
  suggestionsList.innerHTML = "";

  // 🔵 LIMPIAR COLORES DE TODAS LAS MESAS
  document.querySelectorAll(".mesaItem").forEach(m => {
    m.style.backgroundColor = "white";
    m.style.color = "#112250";
    m.style.borderColor = "#112250";
  });

  if (input === "") return;

  // Buscar coincidencias
 // Buscar coincidencias (búsqueda por tokens, insensible a tildes/mayúsculas y a iniciales)
    const tokens = input.split(" ").filter(Boolean);
    const matches = invitados.filter(person => {
      const name = normalizar(person.nombre);
      return tokens.every(tok => name.includes(tok));
    });

  // Si no hay coincidencias
  if (matches.length === 0) {
    resultDiv.innerHTML = `<p class="text-red-600">No se encontró el nombre.</p>`;
    return;
  }

  // Buscar coincidencia EXACTA (para marcar mesa)
  const exact = invitados.find(
  person => normalizar(person.nombre) === input
  );
  // Si hay coincidencia exacta → mostrar resultado directo
  if (exact) {
    resultDiv.innerHTML = `
      <p class="text-2xl font-semibold">
        Mesa <span class="text-[#112250] font-bold">${exact.mesa}</span>
      </p>
    `;

    // 🔵 MARCAR LA MESA EN EL MAPA
    const mesaCircle = document.getElementById(`mesa-${exact.mesa}`);
    if (mesaCircle) {
      mesaCircle.style.backgroundColor = "#112250";
      mesaCircle.style.color = "white";
      mesaCircle.style.borderColor = "#E0C58F";
    }

    return;
  }

  // Si no hay exacto, pero hay parciales → sugerencias
  suggestionsList.innerHTML = matches
    .map(
      m => `
      <li class="cursor-pointer p-2 border-b" onclick="seleccionarSugerencia('${m.nombre}')">
        ${m.nombre}
      </li>
    `
    )
    .join("");
}


function openModal() {
  document.getElementById("imageModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("imageModal").classList.add("hidden");
}

function filtrarTexto(input) {
  input.value = input.value
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")  // solo letras y espacios
    .replace(/\s+/g, " ");                     // evita múltiples espacios
}

function centrarTexto(input) {
  if (input.value.trim().length > 0) {
    input.classList.remove("text-left");
    input.classList.add("text-center");
  } else {
    input.classList.remove("text-center");
    input.classList.add("text-left");
  }
}

function seleccionarSugerencia(nombre) {
  document.getElementById("searchInput").value = nombre;
  searchGuest();
}


// Generar mesas del 1 al 32 visualmente
function generarMesas() {
  const cont = document.getElementById("mesasContainer");

  for (let i = 1; i <= 32; i++) {
    const mesa = document.createElement("div");
    mesa.id = `mesa-${i}`;
    mesa.dataset.num = i;

    mesa.className = `
      mesaItem  
      w-20 h-20 flex items-center justify-center rounded-full 
      border-2 border-[#112250] text-[#112250] font-bold
      transition-all duration-300
      active:scale-95
    `;

    mesa.innerText = i;

    mesa.addEventListener("click", () => mostrarIntegrantesMesa(i));

    cont.appendChild(mesa);
  }
}
generarMesas();


function mostrarIntegrantesMesa(numMesa) {
  const integrantes = invitados
    .filter(p => p.mesa == numMesa)
    .map(p => p.nombre);

  abrirModalMesa(numMesa, integrantes);
}


function abrirModalMesa(numMesa, integrantes) {
  document.getElementById("modalMesaTitulo").innerText = `Mesa ${numMesa}`;

  document.getElementById("modalMesaLista").innerHTML = integrantes
    .map(n => `<li class="text-lg py-1">${n}</li>`).join("");

  const modal = document.getElementById("modalMesa");
  const content = document.getElementById("modalMesaContent");

  modal.classList.remove("hidden");

  // Animación (fade + scale)
  requestAnimationFrame(() => {
    modal.classList.add("opacity-100");
    content.classList.add("scale-100");
  });
}

function cerrarModalMesa(e) {
  const modal = document.getElementById("modalMesa");
  const content = document.getElementById("modalMesaContent");

  // Animación inversa
  modal.classList.remove("opacity-100");
  content.classList.remove("scale-100");

  // Esperar animación antes de ocultar
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 250);
}


/* ======== Pan + Zoom en el contenedor del mapa (no toca tu lógica) ======== */
(function() {
  const mapFrame = document.getElementById("mapFrame");
  const mesasContainer = document.getElementById("mesasContainer");
  if (!mapFrame || !mesasContainer) return;

  let scale = 1;
  let originX = 0, originY = 0;
  let lastX = 0, lastY = 0;
  let posX = 0, posY = 0;
  let isPanning = false;
  let pointers = new Map();

  // Aplicar transform
  function applyTransform() {
    mesasContainer.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    mesasContainer.style.transformOrigin = `${originX}px ${originY}px`;
  }

  // Wheel zoom (desktop)
  mapFrame.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = mesasContainer.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    const newScale = Math.min(2.5, Math.max(0.7, scale + delta));
    // adjust pos to zoom toward mouse pointer
    posX -= (mx / scale - mx / newScale);
    posY -= (my / scale - my / newScale);
    scale = newScale;
    applyTransform();
  }, { passive: false });

  // Pointer events for pan + pinch
  mapFrame.addEventListener("pointerdown", (e) => {
    pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (pointers.size === 1) {
      isPanning = true;
      lastX = e.clientX;
      lastY = e.clientY;
      mapFrame.setPointerCapture(e.pointerId);
    }
  });

  mapFrame.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});

    if (pointers.size === 1 && isPanning) {
      // single pointer – pan
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      posX += dx;
      posY += dy;
      lastX = e.clientX;
      lastY = e.clientY;
      applyTransform();
    } else if (pointers.size === 2) {
      // pinch-to-zoom
      const it = pointers.values();
      const p1 = it.next().value;
      const p2 = it.next().value;
      const curDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      // store previous distance on mapFrame for next move
      if (!mapFrame._lastDist) {
        mapFrame._lastDist = curDist;
        return;
      }
      const lastDist = mapFrame._lastDist;
      const diff = (curDist - lastDist) * 0.01;
      const newScale = Math.min(2.5, Math.max(0.7, scale + diff));

      // set zoom origin to midpoint
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const rect = mesasContainer.getBoundingClientRect();
      const mx = midX - rect.left;
      const my = midY - rect.top;

      posX -= (mx / scale - mx / newScale);
      posY -= (my / scale - my / newScale);

      scale = newScale;
      mapFrame._lastDist = curDist;
      applyTransform();
    }
  });

  mapFrame.addEventListener("pointerup", (e) => {
    pointers.delete(e.pointerId);
    mapFrame._lastDist = null;
    if (pointers.size === 0) isPanning = false;
    try { mapFrame.releasePointerCapture(e.pointerId); } catch (err) {}
  });

  mapFrame.addEventListener("pointercancel", (e) => {
    pointers.delete(e.pointerId);
    mapFrame._lastDist = null;
    if (pointers.size === 0) isPanning = false;
  });

  // Double-tap to reset
  let lastTap = 0;
  mapFrame.addEventListener("pointerdown", (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // reset transform
      scale = 1; posX = 0; posY = 0;
      applyTransform();
    }
    lastTap = now;
  });

  // Make sure mesasContainer starts with transform style
  mesasContainer.style.transform = "translate(0px, 0px) scale(1)";
  mesasContainer.style.willChange = "transform";
})();