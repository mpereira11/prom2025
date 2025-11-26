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
  const raw = document.getElementById("searchInput").value;
  const resultDiv = document.getElementById("result");
  const suggestionsList = document.getElementById("suggestions");

  resultDiv.innerHTML = "";
  suggestionsList.innerHTML = "";

  const input = normalizar(raw);
  if (input.length === 0) return;

  // Separa en tokens, por ejemplo "carlos abondano" -> ["carlos","abondano"]
  const tokens = input.split(" ").filter(Boolean);

  // Buscar coincidencias: el nombre normalizado debe contener TODOS los tokens (any order)
  const matches = invitados
    .filter(item => {
      const name = normalizar(item.nombre);
      // every token debe estar incluido en el nombre
      return tokens.every(tok => name.includes(tok));
    })
    .slice(0, 8); // <-- máximo 8 resultados

  // Mostrar sugerencias (lista)
  matches.forEach(item => {
    const li = document.createElement("li");
    li.className =
      "flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50";

    li.innerHTML = `
      <span class="text-gray-800 text-sm sm:text-base">${item.nombre}</span>
      <span class="text-[#000582] font-semibold ml-4">Mesa ${item.mesa}</span>
    `;

    li.addEventListener("click", () => {
      suggestionsList.innerHTML = "";
      resultDiv.innerHTML = `
        <div class="text-lg sm:text-xl font-semibold text-center">
          ${item.nombre} está en la <span class="text-[#000582]">Mesa ${item.mesa}</span>
        </div>
      `;
      document.getElementById("searchInput").value = item.nombre;
    });

    suggestionsList.appendChild(li);
  });

  // Si hay coincidencia exacta (todos los tokens forman exactamente el nombre), mostrar como resultado
  const exact = matches.find(
    item => normalizar(item.nombre) === input
  );

  if (exact) {
    resultDiv.innerHTML = `
      <div class="text-lg sm:text-xl font-semibold text-center">
        ${exact.nombre} está en la <span class="text-[#000582]">Mesa ${exact.mesa}</span>
      </div>
    `;
  }

  // Si no hay matches, mostrar "No encontrado"
  if (matches.length === 0) {
    resultDiv.innerHTML = `<div class="text-sm text-center text-gray-500">No se encontraron resultados</div>`;
  }
}

function openModal() {
  document.getElementById("imageModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("imageModal").classList.add("hidden");
}


