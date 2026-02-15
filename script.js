// --- Datos base ---

const tasasDivision = {
  "Medicina Interna": 0.828,
  "Cirugía": 1.337,
  "Ginecología": 4.386,
  "Pediatría": 9.259
};

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

// --- DOM ---
const divisionSelect = document.getElementById("division");
const servicioSelect = document.getElementById("servicio");
const turnoSelect = document.getElementById("turno");
const numPersonalInput = document.getElementById("num-personal");
const oportunidadesBloqueSelect = document.getElementById("oportunidades-bloque");
const diasHabilesInput = document.getElementById("dias-habiles");
const btnCalcular = document.getElementById("btn-calcular");
const resultadoDiv = document.getElementById("resultado");
const pdfContainer = document.getElementById("pdf-container");
const btnPDF = document.getElementById("btn-pdf");

// --- Cargar servicios ---
divisionSelect.addEventListener("change", () => {
  const division = divisionSelect.value;
  servicioSelect.innerHTML = "";
  servicioSelect.disabled = true;

  if (!division || !serviciosPorDivision[division]) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Primero seleccione una División";
    servicioSelect.appendChild(opt);
    return;
  }

  servicioSelect.disabled = false;

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

// --- Cálculo ---
let datosCalculo = null;

btnCalcular.addEventListener("click", () => {
  const hospital = document.getElementById("hospital").value;
  const division = divisionSelect.value;
  const servicioNombre = servicioSelect.value;
  const turno = turnoSelect.value;
  const numPersonal = parseFloat(numPersonalInput.value);
  const oportunidadesBloque = parseFloat(oportunidadesBloqueSelect.value);
  const diasHabiles = parseFloat(diasHabilesInput.value);

  if (!hospital || !division || !servicioNombre || !turno ||
      isNaN(numPersonal) || numPersonal <= 0 ||
      isNaN(oportunidadesBloque) || oportunidadesBloque <= 0 ||
      isNaN(diasHabiles) || diasHabiles <= 0) {
    mostrarResultado("Por favor, complete todos los campos antes de realizar el cálculo.", true);
    pdfContainer.classList.add("oculto");
    return;
  }

  const tasaObservacion = tasasDivision[division];
  const servicioObj = serviciosPorDivision[division].find(s => s.nombre === servicioNombre);

  if (!servicioObj) {
    mostrarResultado("No se encontró el servicio seleccionado. Verifique la selección.", true);
    pdfContainer.classList.add("oculto");
    return;
  }

  const factorCriticidad = servicioObj.factor;

  const C = numPersonal * tasaObservacion;
  const D = C * factorCriticidad;
  const E = D / oportunidadesBloque;
  const F = E / diasHabiles;

  const D_r = Math.ceil(D);
  const E_r = Math.ceil(E);
  const F_r = Math.ceil(F);

  datosCalculo = {
    fecha: new Date(),
    hospital,
    division,
    servicioNombre,
    turno,
    numPersonal,
    oportunidadesBloque,
    diasHabiles,
    tasaObservacion,
    factorCriticidad,
    C, D, E, F,
    D_r, E_r, F_r
  };

  const textoResultado = `
    <p><strong>Resultado de la planeación operativa</strong></p>

    <p>
      Para el servicio de <strong>${servicioNombre}</strong>, turno <strong>${turno}</strong>,
      y con base en la información proporcionada, será necesario realizar un total de
      <strong>${D_r}</strong> evaluaciones de higiene de manos durante los próximos 30 días.
    </p>

    <p>
      Estas evaluaciones deberán organizarse en <strong>${E_r}</strong> bloques de 30 minutos,
      cada uno con un mínimo de <strong>${oportunidadesBloque}</strong> oportunidades de observación.
    </p>

    <p>
      Los bloques se distribuirán a lo largo de los <strong>${diasHabiles}</strong> días hábiles
      que usted indicó como disponibles.
    </p>

    <p>
      <strong>IMPORTANTE:</strong> Para asegurar representatividad, varíe intencionalmente los horarios,
      trayectos dentro del servicio y personas observadas, evitando patrones fijos.
    </p>
  `;

  mostrarResultado(textoResultado, false);
  pdfContainer.classList.remove("oculto");
});

// --- Mostrar resultado ---
function mostrarResultado(html, esError = false) {
  resultadoDiv.classList.remove("oculto");
  resultadoDiv.innerHTML = html;
  resultadoDiv.style.color = esError ? "#b00020" : "#222222";
}

// --- Generar PDF ---
btnPDF.addEventListener("click", () => {
  if (!datosCalculo) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const fechaStr = datosCalculo.fecha.toLocaleString("es-MX", {
    dateStyle: "full",
    timeStyle: "short"
  });

  let y = 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Planeación de Supervisiones de Higiene de Manos (PIHMA)", 15, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Fecha y hora del cálculo: ${fechaStr}`, 15, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("Datos proporcionados por el usuario:", 15, y);
  y += 6;

  const datos = [
    `Hospital: ${datosCalculo.hospital}`,
    `División: ${datosCalculo.division}`,
    `Servicio: ${datosCalculo.servicioNombre}`,
    `Turno: ${datosCalculo.turno}`,
    `Personal presente: ${datosCalculo.numPersonal}`,
    `Oportunidades por bloque: ${datosCalculo.oportunidadesBloque}`,
    `Días hábiles disponibles: ${datosCalculo.diasHabiles}`
  ];

  doc.setFont("helvetica", "normal");
  datos.forEach(linea => {
    doc.text(linea, 20, y);
    y += 6;
  });

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Resultados del cálculo:", 15, y);
  y += 8;

  doc.setFont("helvetica", "normal");

  const textoCompleto = [
    `Para el servicio de ${datosCalculo.servicioNombre}, turno ${datosCalculo.turno},`,
    `y con base en la información proporcionada, será necesario realizar un total de`,
    `${datosCalculo.D_r} evaluaciones de higiene de manos durante los próximos 30 días.`,
    ``,
    `Estas evaluaciones deberán organizarse en ${datosCalculo.E_r} bloques de 30 minutos,`,
    `cada uno con un mínimo de ${datosCalculo.oportunidadesBloque} oportunidades de observación.`,
    ``,
    `Los bloques se distribuirán a lo largo de los ${datosCalculo.diasHabiles} días hábiles`,
    `que usted indicó como disponibles.`,
    ``,
    `IMPORTANTE: Para asegurar representatividad, varíe intencionalmente los horarios,`,
    `trayectos dentro del servicio y personas observadas, evitando patrones fijos.`
  ];

  textoCompleto.forEach(linea => {
    doc.text(linea, 15, y);
    y += 6;
  });

  doc.save("PIHMA_Calculo.pdf");
});