import { DENOMINACIONES, calcularDesgloseIndependiente } from './Contabilizador.js';
import {
  renderTablaUnica,
  setSugerenciaInicial,
  actualizarTabla,
  filtrarFilasIngresadas,
  mostrarNotificacion,
  initCalculadora,
  bindCalculatorUI,
  bindMonedaUI
} from './ui.js';
import { initFormateoMillares, parseCantidadFormateada } from './fromateoMillar.js';

document.addEventListener('DOMContentLoaded', () => {
  // Nodos principales
  const contenedorNotificaciones = document.getElementById('contenedorNotificaciones');
  const formCantidad = document.getElementById('formCantidad');
  const inputCantidad = document.getElementById('cantTotal');
  const formUnico = document.getElementById('formUnico');
  const tablaDenominaciones = document.getElementById('tablaDenominaciones');

  // Botones
  const btnLimpiar = document.getElementById('btnLimpiar');
  const btnValidar = document.getElementById('btnValidar');

  // Monedas
  const btnMoneda = document.getElementById('btnMoneda');
  const menuMoneda = document.getElementById('menuMoneda');
  const selectMoneda = document.getElementById('selectMoneda');
  const inputMoneda = document.getElementById('inputMoneda');

  // Estado
  let totalObjetivo = 0;
  let sugerenciaInicial = [];

  // Calculadora bottom
  initCalculadora();
  bindCalculatorUI();

  // Conversor bottom
  bindMonedaUI();

  // Formateo de millares con comillas en #cantTotal
  initFormateoMillares(inputCantidad);

  // Conversión USD/EUR -> cantTotal
  function aplicarConversionMoneda() {
    if (!inputMoneda || !selectMoneda || !inputCantidad) return;
    const cantidadMoneda = parseFloat(String(inputMoneda.value).replace(',', '.'));
    if (!Number.isFinite(cantidadMoneda) || cantidadMoneda <= 0) return;
    const tasa = selectMoneda.value === 'USD' ? 450 : 500;
    const convertido = Math.floor(cantidadMoneda * tasa);
    inputCantidad.value = Number(convertido).toLocaleString('es-ES').replace(/\./g, "'");
  }
  if (selectMoneda) selectMoneda.addEventListener('change', aplicarConversionMoneda);
  if (inputMoneda) inputMoneda.addEventListener('input', aplicarConversionMoneda);

  // Establecer total objetivo y mostrar formulario
  formCantidad.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const valor = parseCantidadFormateada(inputCantidad.value);

    if (!Number.isFinite(valor) || valor <= 0) {
      mostrarNotificacion(contenedorNotificaciones, 'error', 'Por favor ingresa un número válido mayor que 0.', 4000);
      return;
    }

    totalObjetivo = Math.floor(valor);
    sugerenciaInicial = calcularDesgloseIndependiente(totalObjetivo);

    renderTablaUnica(tablaDenominaciones, DENOMINACIONES);
    setSugerenciaInicial(tablaDenominaciones, sugerenciaInicial);

    formUnico.classList.remove('oculto', 'validado', 'excedido');
    mostrarNotificacion(contenedorNotificaciones, 'exito', 'Total establecido correctamente.', 4000);
  });

  // Actualizaciones en tiempo real en manual
  formUnico.addEventListener('input', (ev) => {
    if (ev.target.classList.contains('input-fajo') || ev.target.classList.contains('input-suelto')) {
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

  // Validar y filtrar
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
      mostrarNotificacion(contenedorNotificaciones, 'exito', 'Validación realizada. Se muestran solo las filas con valores.', 4000);
    });
  }

  // Limpiar
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      tablaDenominaciones.innerHTML = '';
      totalObjetivo = 0;
      sugerenciaInicial = [];
      inputCantidad.value = '';
      formUnico.classList.add('oculto');
      formUnico.classList.remove('validado', 'excedido');
      mostrarNotificacion(contenedorNotificaciones, 'info', 'Formulario limpiado.', 3000);
    });
  }
});













