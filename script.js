// --- Datos base ---

// Tasas de observación por División (A)
const tasasDivision = {
  "Medicina Interna": 0.828,
  "Cirugía": 1.337,
  "Ginecología": 4.386,
  "Pediatría": 9.259
};

// Servicios por División y factores de criticidad (B)
const serviciosPorDivision = {
  "Medicina Interna": [
    { nombre: "Urgencias Adultos", factor: 1.50 },
    { nombre: "Hospitalización", factor: 1.25 },
    { nombre: "Unidad de Cuidados Intensivos Adultos (UCI)", factor: 1.50 },
    { nombre: "Hemodiálisis", factor: 1.50 },
    { nombre: "Imagenología", factor: 1.00 },
    { nombre: "Laboratorio Clínico", factor: 1.00 },
    { nombre: "Banco de Sangre", factor: 1.00 },
    { nombre: "Inhaloterapia", factor: 1.25 },
    { nombre: "Consulta Externa", factor: 1.00 }
  ],

  "Pediatría": [
    { nombre: "Urgencias Pediátricas", factor: 1.50 },
    { nombre: "Unidad de Cuidados Intensivos Neonatales (UCIN)", factor: 1.50 },
    { nombre: "Unidad de Cuidados Intensivos Pediátricos (UCIP)", factor: 1.50 },
    { nombre: "Hospitalización", factor: 1.25 },
    { nombre: "Consulta Externa", factor: 1.00 }
  ],

  "Cirugía": [
    { nombre: "Hospitalización", factor: 1.25 },
    { nombre: "Quirófanos", factor: 1.50 },
    { nombre: "Central de Equipos y Esterilización (CEyE)", factor: 1.25 },
    { nombre: "Recuperación Postanestésica", factor: 1.50 },
    { nombre: "Endoscopía", factor: 1.25 },
    { nombre: "Consulta Externa", factor: 1.00 }
  ],

  "Ginecología": [
    { nombre: "Tococirugía", factor: 1.50 },
    { nombre: "Hospitalización", factor: 1.25 },
    { nombre: "Trabajo de Parto", factor: 1.50 },
    { nombre: "Consulta Externa", factor: 1.00 }
  ]
};

// --- Referencias a elementos del DOM ---
const divisionSelect = document.getElementById("division");
const servicioSelect = document.getElementById("servicio");
const numPersonalInput = document.getElementById("num-personal");
const oportunidadesBloqueSelect = document.getElementById("oportunidades-bloque");
const diasHabilesInput = document.getElementById("dias-habiles");
const btnCalcular = document.getElementById("btn-calcular");
const resultadoDiv = document.getElementById("resultado");

// --- Cargar servicios según División seleccionada ---
divisionSelect.addEventListener("change", () => {
  const division = divisionSelect.value;
  servicioSelect.innerHTML = "";

  if (!division || !serviciosPorDivision[division]) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Primero seleccione una División";
    servicioSelect.appendChild(opt);
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Seleccione un Servicio";
  servicioSelect.appendChild(placeholder);

  const listaServicios = [...serviciosPorDivision[division]].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es")
  );

  listaServicios.forEach(serv => {
    const opt = document.createElement("option");
    opt.value = serv.nombre;
    opt.textContent = serv.nombre;
    servicioSelect.appendChild(opt);
  });
});

// --- Función de cálculo principal ---
btnCalcular.addEventListener("click", () => {
  const hospital = document.getElementById("hospital").value;
  const division = divisionSelect.value;
  const servicioNombre = servicioSelect.value;
  const numPersonal = parseFloat(numPersonalInput.value);
  const oportunidadesBloque = parseFloat(oportunidadesBloqueSelect.value);
  const diasHabiles = parseFloat(diasHabilesInput.value);

  if (!hospital || !division || !servicioNombre || !numPersonal || !oportunidadesBloque || !diasHabiles) {
    mostrarResultado("Por favor, complete todos los campos antes de realizar el cálculo.", true);
    return;
  }

  const tasaObservacion = tasasDivision[division];
  const servicioObj = serviciosPorDivision[division].find(s => s.nombre === servicioNombre);

  if (!servicioObj) {
    mostrarResultado("No se encontró el servicio seleccionado. Verifique la selección.", true);
    return;
  }

  const factorCriticidad = servicioObj.factor;

  // --- Cálculos internos ---
  const C = numPersonal * tasaObservacion;
  const D = C * factorCriticidad;
  const E = D / oportunidadesBloque;
  const F = E / diasHabiles;

  // --- Redondeo hacia arriba ---
  const D_r = Math.ceil(D);
  const E_r = Math.ceil(E);
  const F_r = Math.ceil(F);

  // --- Resultado visible ---
  const textoResultado = `
    <p><strong>Resultado de la planeación operativa</strong></p>

    <p>
      Con base en la información proporcionada, para cumplir con la cuota mínima de evaluaciones de higiene de manos
      durante los próximos 30 días será necesario realizar un total de <strong>${D_r}</strong> evaluaciones,
      organizadas en <strong>${E_r}</strong> bloques de 30 minutos
      (y cada uno de estos bloques con un mínimo de ${oportunidadesBloque} <strong>oportunidades</strong> de observación).
    </p>

    <p>
      Para asegurar que las observaciones sean representativas y no se concentren siempre en las mismas personas o momentos,
      basta con variar intencionalmente los horarios, los trayectos dentro del servicio y las personas observadas, evitando
      patrones fijos o preferencias personales.
    </p>
  `;

  mostrarResultado(textoResultado, false);
});

// --- Mostrar resultado ---
function mostrarResultado(html, esError = false) {
  resultadoDiv.classList.remove("oculto");
  resultadoDiv.innerHTML = html;
  resultadoDiv.style.color = esError ? "#b00020" : "#222222";
}


