const dolarApiBaseURL = "https://api.argentinadatos.com";
const dolarPath = "/v1/cotizaciones/dolares";
let cotizacionChart = null;
const dolarDashboardContainer = document.getElementById("dolar-dashboard");

async function fetchDolarData() {
  try {
    const response = await fetch(`${dolarApiBaseURL}${dolarPath}`);
    if (!response.ok) throw new Error("Error al obtener cotizaciones");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al consultar la API de dólar:", error);
    return [];
  }
}

function splitCotizationsByType(data) {
  const cotizacionesPorCasa = {};
  data.forEach((entry) => {
    const casa = entry.casa;
    if (!cotizacionesPorCasa[casa]) {
      cotizacionesPorCasa[casa] = [];
    }
    cotizacionesPorCasa[casa].push(entry);
  });
  return cotizacionesPorCasa;
}


function renderSelectedCotization(casa, cotizationsVector, cantidad = 10) {
  const cotizaciones = cotizationsVector[casa];
  if (!cotizaciones || cotizaciones.length === 0) return;

  const recientes = cotizaciones.slice(-cantidad); // últimas N
  const ultima = recientes[recientes.length - 1];

  let resultadoDiv = document.getElementById("cotizacion-resultado");
  if (resultadoDiv) resultadoDiv.remove();

  resultadoDiv = document.createElement("div");
  resultadoDiv.id = "cotizacion-resultado";
  resultadoDiv.className = "mt-3";

  resultadoDiv.innerHTML = `
    <div class="card p-4">
      <h5 class="text-capitalize">${casa}</h5>
      <p><strong>Compra:</strong> $${ultima.compra}</p>
      <p><strong>Venta:</strong> $${ultima.venta}</p>
      <p class="text-muted">Fecha: ${ultima.fecha}</p>
      <canvas id="cotizacionChart" height="300"></canvas>
    </div>
  `;

  const container = document.getElementById("dolar-dashboard");
  container.appendChild(resultadoDiv);

  if (cotizacionChart) {
    cotizacionChart.destroy();
  }

  const fechas = recientes.map(c => c.fecha);
  const precios = recientes.map(c => c.venta);

  const ctx = document.getElementById("cotizacionChart").getContext("2d");
  cotizacionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: fechas,
      datasets: [{
        label: "Venta",
        data: precios,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: false },
        x: { ticks: { color: "#fff" } }
      },
      plugins: {
        legend: { labels: { color: "#ffffff" } }
      }
    }
  });
}

function renderDolarDashboard(data) {
  const cotizationsVector = splitCotizationsByType(data);
  const casas = Object.keys(cotizationsVector);
  const container = document.getElementById("dolar-dashboard");
  container.innerHTML = "";

  const casaSelect = document.createElement("select");
  casaSelect.className = "form-select mb-3";
  casaSelect.id = "casa-select";

  casas.forEach((casa) => {
    const option = document.createElement("option");
    option.value = casa;
    option.textContent = casa.charAt(0).toUpperCase() + casa.slice(1);
    casaSelect.appendChild(option);
  });

  const periodSelect = document.createElement("select");
  periodSelect.className = "form-select mb-3 ms-3";
  periodSelect.id = "period-select";

  [5, 10, 15, 20].forEach((num) => {
    const option = document.createElement("option");
    option.value = num;
    option.textContent = `${num} mediciones`;
    if (num === 10) option.selected = true;
    periodSelect.appendChild(option);
  });

  const selectRow = document.createElement("div");
  selectRow.className = "d-flex align-items-center mb-3";
  selectRow.appendChild(casaSelect);
  selectRow.appendChild(periodSelect);

  container.appendChild(selectRow);

  function renderActual() {
    renderSelectedCotization(casaSelect.value, cotizationsVector, parseInt(periodSelect.value));
  }

  casaSelect.addEventListener("change", renderActual);
  periodSelect.addEventListener("change", renderActual);

  renderActual(); // primera carga
}

(async function initDolarDashboard() {
  const data = await fetchDolarData();
  renderDolarDashboard(data);
})();
