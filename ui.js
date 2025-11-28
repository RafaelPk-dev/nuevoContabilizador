import { formatearMoneda } from './Contabilizador.js';

/**
 * Mapa de emojis por denominación
 */
const emojiPorDenominacion = {
  1000: "💵",
  500: "💵",
  200: "💵",
  100: "💵",
  50: "💵",
  20: "💵",
  10: "💵",
  5: "💵",
  3: "💵",
  1: "💵"
};

/**
 * Render del panel superior (contador/faltante).
 * SOLO genera bloques con clase "bloque-fajo".
 */
export function renderListaFajosFaltante(contenedorLista, desglose) {
  contenedorLista.innerHTML = '';

  for (const it of desglose) {
    const emoji = emojiPorDenominacion[it.denominacion] || "💵";
    const bloque = document.createElement('div');
    bloque.className = 'bloque-fajo';
    bloque.innerHTML = `
      <div class="titulo">Denominación: ${emoji} $${it.denominacion}</div>
      <div class="linea">
        <span>Fajos (100):</span>
        <input type="text" class="input" value="${it.fajos}" readonly />
      </div>
      <div class="linea">
        <span>Billetes sueltos:</span>
        <input type="text" class="input" value="${it.sueltos}" readonly />
      </div>
      <div class="linea">
        <span>Subtotal:</span>
        <span class="subtotal-movil">${formatearMoneda(it.subtotal)}</span>
      </div>
    `;
    contenedorLista.appendChild(bloque);
  }
}

/**
 * Render del formulario manual.
 * SOLO genera bloques con clase "bloque-fajo".
 */
export function renderFormularioManual(contenedor, denominaciones) {
  contenedor.innerHTML = '';

  const frag = document.createDocumentFragment();

  denominaciones.forEach((denom) => {
    const emoji = emojiPorDenominacion[denom] || "💵";
    const bloque = document.createElement('div');
    bloque.className = 'bloque-fajo';
    bloque.innerHTML = `
      <div class="titulo">Denominación: ${emoji} $${denom}</div>
      <div class="linea">
        <span>Fajos (100):</span>
        <input type="number" min="0" step="1" value="0"
          class="input-fajo" data-denominacion="${denom}" aria-label="Fajos de ${denom}" />
      </div>
      <div class="linea">
        <span>Billetes sueltos:</span>
        <input type="number" min="0" step="1" value="0"
          class="input-suelto" data-denominacion="${denom}" aria-label="Billetes sueltos de ${denom}" />
      </div>
      <div class="linea">
        <span>Subtotal:</span>
        <span class="subtotal-movil" data-denominacion="${denom}">$0</span>
      </div>
    `;
    frag.appendChild(bloque);
  });

  contenedor.appendChild(frag);
}

/**
 * Sincroniza el valor entre inputs duplicados (desktop/móvil) para una denominación.
 */
function sincronizarDuplicados(contenedor, clase, denominacion, valor) {
  const dupes = contenedor.querySelectorAll(`.${clase}[data-denominacion="${denominacion}"]`);
  dupes.forEach((el) => {
    if (String(el.value) !== String(valor)) el.value = valor;
  });
}

/**
 * Lee los aportes manuales en forma {denominacion, fajos, sueltos}
 * sincroniza duplicados y actualiza los subtotales (solo bloques).
 */
export function leerYActualizarAportes(contenedor) {
  const aportes = [];

  const denomsSet = new Set([
    ...Array.from(contenedor.querySelectorAll('.input-fajo')).map((el) => Number(el.dataset.denominacion)),
    ...Array.from(contenedor.querySelectorAll('.input-suelto')).map((el) => Number(el.dataset.denominacion)),
  ]);

  denomsSet.forEach((denom) => {
    const fajosInputs = contenedor.querySelectorAll(`.input-fajo[data-denominacion="${denom}"]`);
    const sueltosInputs = contenedor.querySelectorAll(`.input-suelto[data-denominacion="${denom}"]`);

    const pickValor = (nodes) => {
      const focused = Array.from(nodes).find((el) => el === document.activeElement);
      if (focused) return focused.value;
      const nonEmpty = Array.from(nodes).find((el) => String(el.value).length > 0);
      return nonEmpty ? nonEmpty.value : '0';
    };

    const fajosVal = Math.max(0, Math.floor(Number(pickValor(fajosInputs)) || 0));
    const sueltosVal = Math.max(0, Math.floor(Number(pickValor(sueltosInputs)) || 0));

    sincronizarDuplicados(contenedor, 'input-fajo', denom, fajosVal);
    sincronizarDuplicados(contenedor, 'input-suelto', denom, sueltosVal);

    const subtotal = (fajosVal * 100 + sueltosVal) * denom;

    const subtotalMovil = contenedor.querySelector(`.subtotal-movil[data-denominacion="${denom}"]`);
    if (subtotalMovil) subtotalMovil.textContent = formatearMoneda(subtotal);

    aportes.push({ denominacion: denom, fajos: fajosVal, sueltos: sueltosVal });
  });

  return aportes;
}

/** Notificación tipo toast */
export function mostrarNotificacion(contenedor, tipo, mensaje, duracionMs = 2200) {
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  contenedor.appendChild(toast);
  setTimeout(() => toast.remove(), duracionMs);
}

/** Actualiza resúmenes superiores y cambia color de la web si se valida */
export function actualizarResumenes(nodoTotal, nodoFaltante, total, faltante) {
  nodoTotal.textContent = `Total: ${formatearMoneda(total)}`;
  nodoFaltante.textContent = `Faltante: ${formatearMoneda(Math.max(0, faltante))}`;

  // Feedback gráfico: si ya se validó el total, cambia color de fondo
  const body = document.body;
  if (faltante === 0 && total > 0) {
    body.classList.add("validado");
  } else {
    body.classList.remove("validado");
  }
}





