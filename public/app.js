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

// Crear una mesa individual
function crearMesa(numero) {
  const mesa = document.createElement("div");
  mesa.id = `mesa-${numero}`;
  mesa.dataset.num = numero;
  mesa.className = `
    mesaItem  
    w-16 h-16 flex items-center justify-center rounded-full 
    border-2 border-[#112250] text-[#112250] font-bold text-lg
    transition-all duration-300
    active:scale-95 cursor-pointer
    hover:shadow-lg
  `;
  mesa.innerText = numero;
  mesa.addEventListener("click", () => mostrarIntegrantesMesa(numero));
  return mesa;
}

// Generar mesas del 1 al 32 con el nuevo layout
function generarMesas() {
  const cont = document.getElementById("mesasContainer");
  cont.innerHTML = ""; // Limpiar contenedor

  // Crear estructura principal
  const layoutWrapper = document.createElement("div");
  layoutWrapper.className = "flex gap-20 items-start justify-center";

  // COLUMNA IZQUIERDA (Mesas 1-8)
  const columnaIzq = document.createElement("div");
  columnaIzq.className = "flex flex-col gap-3";
  
  const columnasIzqData = [
    [3, null, 6],
    [null, 4, null, 9],
    [2, null, 7],
    [null, 5, null, 10],
    [1, null, 8]
  ];

  columnasIzqData.forEach(fila => {
    const filaDiv = document.createElement("div");
    filaDiv.className = "flex gap-3 items-center justify-start";
    fila.forEach(num => {
      if (num === null) {
        const spacer = document.createElement("div");
        spacer.className = "w-16 h-16";
        filaDiv.appendChild(spacer);
      } else {
        filaDiv.appendChild(crearMesa(num));
      }
    });
    columnaIzq.appendChild(filaDiv);
  });

  // COLUMNA DERECHA (Mesas 11-18)
  const columnaDer = document.createElement("div");
  columnaDer.className = "flex flex-col gap-3";
  
  const columnasDerData = [
    [16, null, 11],
    [null, 14],
    [17, null, 12],
    [null, 15],
    [18, null, 13]
  ];

  columnasDerData.forEach(fila => {
    const filaDiv = document.createElement("div");
    filaDiv.className = "flex gap-3 items-center justify-start";
    fila.forEach(num => {
      if (num === null) {
        const spacer = document.createElement("div");
        spacer.className = "w-16 h-16";
        filaDiv.appendChild(spacer);
      } else {
        filaDiv.appendChild(crearMesa(num));
      }
    });
    columnaDer.appendChild(filaDiv);
  });

  // SECCIÓN CENTRAL (Mesas 19-32 con ESCENARIO)
  const seccionCentral = document.createElement("div");
  seccionCentral.className = "flex flex-col items-center gap-4 px-12 py-6 border-l-4 border-r-4 border-[#112250] min-w-[280px]";
  
  // ESCENARIO
  const escenario = document.createElement("div");
  escenario.className = "w-48 h-24 border-4 border-[#112250] bg-[#E0C58F] flex items-center justify-center rounded-lg shadow-lg mb-6";
  const escenarioTexto = document.createElement("div");
  escenarioTexto.className = "text-[#112250] font-bold text-2xl tracking-wide";
  escenarioTexto.innerText = "ESCENARIO";
  escenario.appendChild(escenarioTexto);
  seccionCentral.appendChild(escenario);

  // Espacio adicional antes de las mesas
  const espacioTop = document.createElement("div");
  espacioTop.className = "h-8";
  seccionCentral.appendChild(espacioTop);

  const mesasCentrales = [
    [20, 19],
    [21],
    [23, 22],
    null, // Separador visual
    [25, 24],
    [26],
    [28, 27],
    [29],
    [31, 30],
    [32]
  ];

  mesasCentrales.forEach(fila => {
    if (fila === null) {
      // Línea divisoria
      const separator = document.createElement("div");
      separator.className = "w-full border-t-2 border-dashed border-[#112250] my-2";
      seccionCentral.appendChild(separator);
    } else {
      const filaDiv = document.createElement("div");
      filaDiv.className = "flex gap-3 items-center justify-center";
      fila.forEach(num => {
        filaDiv.appendChild(crearMesa(num));
      });
      seccionCentral.appendChild(filaDiv);
    }
  });

  // Agregar divisor superior e inferior a la sección central
  const topBorder = document.createElement("div");
  topBorder.className = "w-3/4 border-t-2 border-[#112250]";
  seccionCentral.insertBefore(topBorder, seccionCentral.firstChild);

  const bottomBorder = document.createElement("div");
  bottomBorder.className = "w-3/4 border-t-2 border-[#112250] mt-4";
  seccionCentral.appendChild(bottomBorder);

  // Ensamblar layout
  layoutWrapper.appendChild(columnaIzq);
  layoutWrapper.appendChild(seccionCentral);
  layoutWrapper.appendChild(columnaDer);
  
  cont.appendChild(layoutWrapper);
}

generarMesas();

// Variables para zoom y pan
let currentZoom = 0.7; // Zoom inicial más alejado
let isPanning = false;
let startX, startY, scrollLeft, scrollTop;

const wrapper = document.getElementById("mesasZoomWrapper");
const container = document.getElementById("mesasContainer");

// Aplicar zoom inicial y centrar
function inicializarVista() {
  applyZoom();
  // Pequeño delay para asegurar que el contenido esté renderizado
  setTimeout(() => {
    centrarContenido();
  }, 100);
}

// Centrar el contenido horizontalmente
function centrarContenido() {
  const wrapperWidth = wrapper.clientWidth;
  const containerWidth = container.scrollWidth * currentZoom;
  const scrollX = (containerWidth - wrapperWidth) / 2;
  wrapper.scrollLeft = Math.max(0, scrollX);
}

// Funciones de zoom
function zoomIn() {
  currentZoom = Math.min(currentZoom + 0.2, 3);
  applyZoom();
}

function zoomOut() {
  currentZoom = Math.max(currentZoom - 0.2, 0.4);
  applyZoom();
}

function resetZoom() {
  currentZoom = 0.7;
  applyZoom();
  setTimeout(() => {
    centrarContenido();
  }, 50);
}

function applyZoom() {
  container.style.transform = `scale(${currentZoom})`;
}

// Inicializar vista al cargar
inicializarVista();

// Pan con mouse/touch
wrapper.addEventListener("mousedown", (e) => {
  isPanning = true;
  wrapper.style.cursor = "grabbing";
  startX = e.pageX - wrapper.offsetLeft;
  startY = e.pageY - wrapper.offsetTop;
  scrollLeft = wrapper.scrollLeft;
  scrollTop = wrapper.scrollTop;
});

wrapper.addEventListener("mouseleave", () => {
  isPanning = false;
  wrapper.style.cursor = "grab";
});

wrapper.addEventListener("mouseup", () => {
  isPanning = false;
  wrapper.style.cursor = "grab";
});

wrapper.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  e.preventDefault();
  const x = e.pageX - wrapper.offsetLeft;
  const y = e.pageY - wrapper.offsetTop;
  const walkX = (x - startX) * 2;
  const walkY = (y - startY) * 2;
  wrapper.scrollLeft = scrollLeft - walkX;
  wrapper.scrollTop = scrollTop - walkY;
});

// Touch support para móviles
let lastTouchDistance = 0;

wrapper.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    lastTouchDistance = getTouchDistance(e.touches);
  } else if (e.touches.length === 1) {
    isPanning = true;
    startX = e.touches[0].pageX - wrapper.offsetLeft;
    startY = e.touches[0].pageY - wrapper.offsetTop;
    scrollLeft = wrapper.scrollLeft;
    scrollTop = wrapper.scrollTop;
  }
});

wrapper.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const distance = getTouchDistance(e.touches);
    const delta = distance - lastTouchDistance;
    currentZoom = Math.max(0.4, Math.min(3, currentZoom + delta * 0.01));
    applyZoom();
    lastTouchDistance = distance;
  } else if (e.touches.length === 1 && isPanning) {
    const x = e.touches[0].pageX - wrapper.offsetLeft;
    const y = e.touches[0].pageY - wrapper.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    wrapper.scrollLeft = scrollLeft - walkX;
    wrapper.scrollTop = scrollTop - walkY;
  }
});

wrapper.addEventListener("touchend", () => {
  isPanning = false;
  lastTouchDistance = 0;
});

function getTouchDistance(touches) {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

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