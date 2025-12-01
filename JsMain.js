// JsMain.js
import { DENOMINACIONES, calcularDesgloseIndependiente } from './Contabilizador.js';
import {
  renderTablaUnica,
  setSugerenciaInicial,
  actualizarTabla,
  mostrarNotificacion,
  filtrarFilasIngresadas,
  initCalculadora
} from './ui.js';
import { initFormateoMillares, parseCantidadFormateada } from './fromateoMillar.js';

document.addEventListener('DOMContentLoaded', () => {
  // Referencias principales
  const contenedorNotificaciones = document.getElementById('contenedorNotificaciones');
  const formCantidad = document.getElementById('formCantidad');
  const inputCantidad = document.getElementById('cantTotal');

  const formUnico = document.getElementById('formUnico');
  const tablaDenominaciones = document.getElementById('tablaDenominaciones');

  // Header: botones
  const btnLimpiar = document.getElementById('btnLimpiar');
  const btnValidar = document.getElementById('btnValidar');
  const btnCalc = document.getElementById('btnCalc');

  // Calculadora
  const calcContainer = document.getElementById('calcContainer');

  // Menú moneda
  const btnMoneda = document.getElementById('btnMoneda');
  const menuMoneda = document.getElementById('menuMoneda');
  const selectMoneda = document.getElementById('selectMoneda');
  const inputMoneda = document.getElementById('inputMoneda');

  // Estado
  let totalObjetivo = 0;
  let sugerenciaInicial = [];

  // Inicializar calculadora (solo lógica interna, arranca oculta)
  initCalculadora();
  if (calcContainer) calcContainer.classList.add('oculto');
  if (btnCalc && calcContainer) {
    btnCalc.addEventListener('click', () => {
      calcContainer.classList.toggle('oculto');
    });
  }

  // Formateo de millares con comillas en #cantTotal
  initFormateoMillares(inputCantidad);

  // Toggle menú moneda
  if (btnMoneda && menuMoneda) {
    btnMoneda.addEventListener('click', () => {
      menuMoneda.classList.toggle('oculto');
      // Al abrir, limpiar input de moneda para evitar confusiones
      if (!menuMoneda.classList.contains('oculto') && inputMoneda) {
        inputMoneda.value = '';
      }
    });
  }

  // Conversión automática: USD ×450, EUR ×500
  function aplicarConversionMoneda() {
    if (!inputMoneda || !selectMoneda || !inputCantidad) return;

    const cantidadMoneda = parseFloat(String(inputMoneda.value).replace(',', '.'));
    if (!Number.isFinite(cantidadMoneda) || cantidadMoneda < 0) return;

    let tasa = 1;
    const moneda = selectMoneda.value;
    if (moneda === 'USD') tasa = 450;
    else if (moneda === 'EUR') tasa = 500;

    const convertido = Math.floor(cantidadMoneda * tasa);

    // Formatear con comillas de millar: 1'234'567
    const formateado = Number(convertido).toLocaleString('es-ES').replace(/\./g, "'");
    inputCantidad.value = formateado;

    // Opcional: feedback
    mostrarNotificacion(contenedorNotificaciones, 'info', `Conversión aplicada: ${moneda} × ${tasa}`, 3000);
  }

  if (selectMoneda) {
    selectMoneda.addEventListener('change', () => {
      // Al cambiar la moneda, si hay cantidad, aplicar conversión
      aplicarConversionMoneda();
    });
  }

  if (inputMoneda) {
    // Subtotal al teclear en el input de moneda
    inputMoneda.addEventListener('input', () => {
      aplicarConversionMoneda();
    });
  }

  // Establecer total objetivo y renderizar tabla al calcular
  formCantidad.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const valor = parseCantidadFormateada(inputCantidad.value);

    if (!Number.isFinite(valor) || valor < 0) {
      mostrarNotificacion(contenedorNotificaciones, 'error', 'Por favor ingresa un número válido.');
      return;
    }

    totalObjetivo = Math.floor(valor);
    sugerenciaInicial = calcularDesgloseIndependiente(totalObjetivo);

    renderTablaUnica(tablaDenominaciones, DENOMINACIONES);
    setSugerenciaInicial(tablaDenominaciones, sugerenciaInicial);

    formUnico.classList.remove('validado', 'excedido');
    mostrarNotificacion(contenedorNotificaciones, 'exito', 'Total establecido correctamente.', 4000);
  });

  // Actualizaciones en tiempo real al escribir en manual
  formUnico.addEventListener('input', (ev) => {
    const esEditableManual =
      ev.target.classList.contains('input-fajo') ||
      ev.target.classList.contains('input-suelto');

    if (esEditableManual) {
      actualizarTabla(
        tablaDenominaciones,
        totalObjetivo,
        sugerenciaInicial,
        null,
        formUnico,
        contenedorNotificaciones
      );
    }
  });

  // Validar con botón en header
  if (btnValidar) {
    btnValidar.addEventListener('click', () => {
      actualizarTabla(
        tablaDenominaciones,
        totalObjetivo,
        sugerenciaInicial,
        null,
        formUnico,
        contenedorNotificaciones
      );
      filtrarFilasIngresadas(tablaDenominaciones);
      mostrarNotificacion(contenedorNotificaciones, 'exito', 'Validación realizada. Mostrando filas con valores.', 4000);
    });
  }

  // Limpiar
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      // Reset de la tabla y estado
      tablaDenominaciones.innerHTML = '';
      totalObjetivo = 0;
      sugerenciaInicial = [];

      // Reset inputs
      inputCantidad.value = '';
      if (inputMoneda) inputMoneda.value = '';
      if (selectMoneda) selectMoneda.value = 'USD'; // default

      formUnico.classList.remove('validado', 'excedido');
      mostrarNotificacion(contenedorNotificaciones, 'info', 'Formulario limpiado.', 3000);
    });
  }
});











