const dolarApiBaseURL = "https://api.argentinadatos.com";
const dolarPath = "/v1/cotizaciones/dolares";
let cotizacionChart = null;

async function fetchDolarData() {
  try {
    const response = await fetch(`${dolarApiBaseURL}${dolarPath}`);
    if (!response.ok) throw new Error("Error al obtener cotizaciones desde la API");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fallo al consultar la API de dólar:", error);
    console.warn("Cargando datos desde el mock local...");

    try {
      const fallbackResponse = await fetch("data/dolar-mock.json");
      if (!fallbackResponse.ok) throw new Error("Error al cargar el mock local");

      const mockData = await fallbackResponse.json();
      return mockData;
    } catch (fallbackError) {
      console.error("También falló la carga del mock local:", fallbackError);
      return [];
    }
  }
}

function splitCotizationsByType(data) {
  const cotizationByType = {};
  data.forEach((entry) => {
    const type = entry.casa;
    if (!cotizationByType[type]) {
      cotizationByType[type] = [];
    }
    cotizationByType[type].push(entry);
  });
  return cotizationByType;
}

function renderSelectedCotization(type, cotizationsVector, fromDate, toDate) {
  const cotizaciones = cotizationsVector[type];
  if (!cotizaciones || cotizaciones.length === 0) return;

  const filtradas = cotizaciones.filter((c) => {
    const fecha = new Date(c.fecha);
    return fecha >= fromDate && fecha <= toDate;
  });

  if (filtradas.length === 0) return;

  //La ultima que se obtiene del GET
  const ultima = filtradas[filtradas.length - 1];

  let resultadoDiv = document.getElementById("cotizacion-resultado");

  resultadoDiv.innerHTML = `
    <div class="d-flex justify-content-center">
      <div class="border border-light rounded p-4 card">
        <h5 class="text-capitalize">${type}</h5>
          <p><strong>Compra:</strong> $${ultima.compra}</p>
          <p><strong>Venta:</strong> $${ultima.venta}</p>
          <p><strong>Última Actualización:</strong> ${ultima.fecha}</p>
      </div>
    </div>
  `;

  if (cotizacionChart) {
    cotizacionChart.destroy();
  }

  const fechas = filtradas.map((c) => c.fecha);
  const precios = filtradas.map((c) => c.venta);


  let dolarGraphContainer = document.getElementById("dolar-graph-container");
  dolarGraphContainer.innerHTML =  `
    <div class="d-flex justify-content-center border border-light rounded p-4 card" id="dolar-graph-container">
      <canvas id="dolar-graph-canva"></canvas>
    </div>
  `;

  const ctx = document.getElementById("dolar-graph-canva").getContext("2d");
  cotizacionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: fechas,
      datasets: [
        {
          label: "Valor",
          data: precios,
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: false },
        x: { ticks: { color: "#fff" } },
      },
      plugins: {
        legend: { labels: { color: "#ffffff" } },
      },
    },
  });


}

function renderDolarDashboard(data) {
  const cotizationsVector = splitCotizationsByType(data);
  const types = Object.keys(cotizationsVector);

  const selectorsContainer = document.getElementById("dolar-selectors");

  const optionsHTML = types
    .map(
      (casa) =>
        `<option value="${casa}">${
          casa.charAt(0).toUpperCase() + casa.slice(1)
        }</option>`
    )
    .join("");

  selectorsContainer.innerHTML = `
    <div id="dolar-selectors">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h5 class="mb-0">Tipo de Dolar:</h5>
        <select class="form-select mb-3" id="type-select">
          ${optionsHTML}        
        </select>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <h5 class="mb-3">Fecha desde:</h5>
          <input type="date" class="form-control" id="from-date">
        </div>
        <div class="col-md-6">
          <h5 class="mb-3">Fecha hasta:</h5>
          <input type="date" class="form-control" id="to-date">
        </div>
      </div>
    </div>
  `;

  // Referencia al HTML
  const typeSelect = document.getElementById("type-select");
  const fromInput = document.getElementById("from-date");
  const toInput = document.getElementById("to-date");

  // Rango por defecto: último mes
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setMonth(today.getMonth() - 1);
  fromInput.valueAsDate = monthAgo;
  toInput.valueAsDate = today;

  function renderList() {
    const from = new Date(fromInput.value);
    const to = new Date(toInput.value);
    if (to.getTime() == from.getTime()) {
      darkSwal.fire({
        icon: "error",
        title: "Rango de fechas inválido",
        text: "La fecha 'Desde' no puede ser igual a la fecha 'Hasta'",
      });
      return;
    }
    if (from > to) {
      darkSwal.fire({
        icon: "error",
        title: "Rango de fechas inválido",
        text: "La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'",
      });
      return;
    }
    renderSelectedCotization(typeSelect.value, cotizationsVector, from, to);
  }

  typeSelect.addEventListener("change", renderList);
  fromInput.addEventListener("change", renderList);
  toInput.addEventListener("change", renderList);

  renderList();
}

(async function initDolarDashboard() {
  const data = await fetchDolarData();
  renderDolarDashboard(data);
})();
