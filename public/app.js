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

  if (input.length === 0) {
    resultDiv.innerHTML = "";
    return;
  }

  const found = invitados.find(item =>
    item.nombre.toLowerCase().includes(input)
  );

  if (found) {
    resultDiv.innerHTML = `🪑 <span class="text-blue-600">${found.nombre}</span> está en la <b>Mesa ${found.mesa}</b>`;
  } else {
    resultDiv.innerHTML = "❌ No encontrado";
  }
}
