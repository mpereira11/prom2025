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


// Generar mesas con posiciones exactas en forma de "T"
function generarMesas() {
  const cont = document.getElementById("mesasContainer");

  // Coordenadas de cada mesa (left, top)
  const posiciones = {
    // BLOQUE IZQUIERDO (1–10)
    3:  {x: 60,  y: 20},
    4:  {x: 130, y: 70},
    2:  {x: 60,  y: 140},
    5:  {x: 130, y: 190},
    1:  {x: 60,  y: 260},

    6:  {x: 200, y: 20},
    9:  {x: 270, y: 70},
    7:  {x: 200, y: 140},
    10: {x: 270, y: 190},
    8:  {x: 200, y: 260},

    // BLOQUE DERECHO (11–18)
    16: {x: 340, y: 20},
    14: {x: 410, y: 70},
    17: {x: 340, y: 140},
    15: {x: 410, y: 190},
    18: {x: 340, y: 260},

    11: {x: 480, y: 20},
    12: {x: 480, y: 140},
    13: {x: 480, y: 260},

    // TRONCAL CENTRAL (19–32)
    20: {x: 220, y: 360},
    19: {x: 300, y: 360},

    21: {x: 260, y: 430},

    23: {x: 220, y: 510},
    22: {x: 300, y: 510},

    25: {x: 220, y: 600},
    24: {x: 300, y: 600},

    26: {x: 260, y: 670},

    28: {x: 220, y: 750},
    27: {x: 300, y: 750},

    29: {x: 260, y: 820},

    31: {x: 220, y: 900},
    30: {x: 300, y: 900},

    32: {x: 260, y: 980}
  };

  // Crear cada mesa
  for (let i = 1; i <= 32; i++) {
    const mesa = document.createElement("div");
    mesa.id = `mesa-${i}`;
    mesa.dataset.num = i;

    mesa.className = `
      mesaItem  
      w-14 h-14 flex items-center justify-center rounded-full 
      border-2 border-[#112250] text-[#112250] font-bold
      transition-all duration-300
      active:scale-95
      absolute
    `;

    mesa.innerText = i;

    // Aplicar coordenadas exactas
    const pos = posiciones[i];
    mesa.style.left = pos.x + "px";
    mesa.style.top = pos.y + "px";

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