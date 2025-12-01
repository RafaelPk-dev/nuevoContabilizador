// js/main.js
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
  const contenedorNotificaciones = document.getElementById('contenedorNotificaciones');
  const formCantidad = document.getElementById('formCantidad');
  const inputCantidad = document.getElementById('cantTotal');

  const formUnico = document.getElementById('formUnico');
  const tablaDenominaciones = document.getElementById('tablaDenominaciones');

  // Botones y resumen en header
  const btnLimpiar = document.getElementById('btnLimpiar'); // si lo tienes en el header, obténlo igual
  const btnValidar = document.getElementById('btnValidar');
  const resumenManual = document.getElementById('resumenManual');

  let totalObjetivo = 0;
  let sugerenciaInicial = [];

  // Inicializar calculadora
  initCalculadora();

  // Formateo de millares con comillas en #cantTotal
  initFormateoMillares(inputCantidad);

  // Establecer total objetivo y renderizar tabla
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
    if (resumenManual) resumenManual.textContent = 'Aportado manual: $0';
    mostrarNotificacion(contenedorNotificaciones, 'exito', 'Total establecido correctamente.', 5000);
  });

  // Actualizaciones en tiempo real al escribir en manual
  formUnico.addEventListener('input', (ev) => {
    if (ev.target.classList.contains('input-fajo') || ev.target.classList.contains('input-suelto')) {
      actualizarTabla(
        tablaDenominaciones,
        totalObjetivo,
        sugerenciaInicial,
        resumenManual || null,
        formUnico,
        contenedorNotificaciones
      );
    }
  });

  // Validar con el botón del header
  if (btnValidar) {
    btnValidar.addEventListener('click', () => {
      actualizarTabla(
        tablaDenominaciones,
        totalObjetivo,
        sugerenciaInicial,
        resumenManual || null,
        formUnico,
        contenedorNotificaciones
      );
      filtrarFilasIngresadas(tablaDenominaciones);
      mostrarNotificacion(contenedorNotificaciones, 'exito', 'Validación realizada. Se muestran solo las filas con valores.', 5000);
    });
  }

  // Limpiar (si lo mantienes en el header o donde esté)
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      tablaDenominaciones.innerHTML = '';
      if (resumenManual) resumenManual.textContent = 'Aportado manual: $0';
      totalObjetivo = 0;
      sugerenciaInicial = [];
      inputCantidad.value = '';
      formUnico.classList.remove('validado', 'excedido');
      mostrarNotificacion(contenedorNotificaciones, 'info', 'Formulario limpiado.', 5000);
    });
  }
});








