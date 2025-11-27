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


function generarMesas() {
  const cont = document.getElementById("mesasContainer");

  // Coordenadas relativas (0 a 100)
  // Cada "x" y "y" es un porcentaje dentro del contenedor
  const posiciones = {
    3:  {x: 10,  y: 2},
    4:  {x: 22,  y: 6},
    2:  {x: 10,  y: 12},
    5:  {x: 22,  y: 16},
    1:  {x: 10,  y: 22},

    6:  {x: 35,  y: 2},
    9:  {x: 47,  y: 6},
    7:  {x: 35,  y: 12},
    10: {x: 47,  y: 16},
    8:  {x: 35,  y: 22},

    16: {x: 60,  y: 2},
    14: {x: 72,  y: 6},
    17: {x: 60,  y: 12},
    15: {x: 72,  y: 16},
    18: {x: 60,  y: 22},

    11: {x: 84,  y: 2},
    12: {x: 84,  y: 12},
    13: {x: 84,  y: 22},

    20: {x: 38, y: 32},
    19: {x: 50, y: 32},

    21: {x: 44, y: 38},

    23: {x: 38, y: 45},
    22: {x: 50, y: 45},

    25: {x: 38, y: 53},
    24: {x: 50, y: 53},

    26: {x: 44, y: 60},

    28: {x: 38, y: 67},
    27: {x: 50, y: 67},

    29: {x: 44, y: 74},

    31: {x: 38, y: 81},
    30: {x: 50, y: 81},

    32: {x: 44, y: 88}
  };

  for (let i = 1; i <= 32; i++) {
    const mesa = document.createElement("div");
    mesa.id = `mesa-${i}`;
    mesa.dataset.num = i;

    mesa.className = `
      mesaItem  
      absolute flex items-center justify-center rounded-full
      border-2 border-[#112250] text-[#112250] font-bold
      transition-all duration-300 active:scale-95
    `;

    mesa.innerText = i;

    // tamaño relativo
    mesa.style.width = "12%";
    mesa.style.height = "12%";
    mesa.style.fontSize = "1rem";

    // aplicar coordenadas proporcionales
    const pos = posiciones[i];
    mesa.style.left = pos.x + "%";
    mesa.style.top = pos.y + "%";
    mesa.style.transform = "translate(-50%, -50%)";

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