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
  const resultDiv = document.getElementById("result");

  const integrantes = invitados
    .filter(p => p.mesa == numMesa)
    .map(p => p.nombre);

  resultDiv.innerHTML = `
    <div class="text-3xl font-bold text-[#000582] mt-4">
      Mesa ${numMesa}
    </div>
    <ul class="mt-2 text-center">
      ${integrantes.map(n => `<li class="text-lg">${n}</li>`).join("")}
    </ul>
  `;
}

