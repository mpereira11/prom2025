let invitados = [];

// Cargar JSON
fetch("./invitados.json")
  .then(res => res.json())
  .then(data => {
    invitados = data;
  })
  .catch(err => console.error("Error cargando JSON:", err));

function searchGuest() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const resultDiv = document.getElementById("result");
  const suggestionsList = document.getElementById("suggestions");

  resultDiv.innerHTML = "";
  suggestionsList.innerHTML = "";

  if (input.length === 0) return;

  // Filtrar coincidencias
  const matches = invitados
    .filter(item => item.nombre.toLowerCase().includes(input))
    .slice(0, 5); // máximo 5

  // Mostrar sugerencias
  matches.forEach(item => {
    const li = document.createElement("li");
    li.className =
      "flex justify-between items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-100";

    li.innerHTML = `
      <span class="text-gray-800">${item.nombre}</span>
      <span class="text-[#000582] font-semibold">Mesa ${item.mesa}</span>
    `;

    // Si el usuario toca la sugerencia → mostrarla como resultado final
    li.addEventListener("click", () => {
      suggestionsList.innerHTML = "";
      resultDiv.innerHTML = `
        <div class="text-xl font-semibold text-center">
          ${item.nombre} está en la <span class="text-[#000582]">Mesa ${item.mesa}</span>
        </div>
      `;
      document.getElementById("searchInput").value = item.nombre;
    });

    suggestionsList.appendChild(li);
  });

  // Si solo hay una coincidencia exacta
  const exact = matches.find(
    item => item.nombre.toLowerCase() === input.trim()
  );

  if (exact) {
    resultDiv.innerHTML = `
      <div class="text-xl font-semibold text-center">
        ${exact.nombre} está en la <span class="text-[#000582]">Mesa ${exact.mesa}</span>
      </div>
    `;
  }
}

