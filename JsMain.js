// js/main.js
import { DENOMINACIONES, calcularDesgloseIndependiente, totalAportadoManual, formatearMoneda } from './Contabilizador.js';
import { renderListaFajosFaltante, renderFormularioManual, leerYActualizarAportes, mostrarNotificacion, actualizarResumenes } from './ui.js';
import { validarAportesManual, alternarPanel } from './manual.js';

document.addEventListener('DOMContentLoaded', () => {
    const contenedorNotificaciones = document.getElementById('contenedorNotificaciones');

    // Panel superior
    const panelCalculo = document.getElementById('panelCalculo');
    const btnToggleCalculo = document.getElementById('btnToggleCalculo');
    const formCantidad = document.getElementById('formCantidad');
    const inputCantidad = document.getElementById('cantTotal');
    const listaFajos = document.getElementById('listaFajos');
    const resumenTotal = document.getElementById('resumenTotal');
    const resumenFaltante = document.getElementById('resumenFaltante');
    const btnLimpiar = document.getElementById('btnLimpiar');

    // Panel manual
    const panelManual = document.getElementById('panelManual');
    const btnToggleManual = document.getElementById('btnToggleManual');
    const formManual = document.getElementById('formManual');
    const listaFajosManual = document.getElementById('listaFajosManual');
    const resumenManual = document.getElementById('resumenManual');
    const btnLimpiarManual = document.getElementById('btnLimpiarManual');

    // Render inicial
    renderFormularioManual(listaFajosManual, DENOMINACIONES);

    // Estado
    let totalObjetivo = 0;
    let aportesManual = [];

    function actualizarPanelSuperior() {
        const totalAportado = totalAportadoManual(aportesManual);
        const faltanteTotal = Math.max(0, totalObjetivo - totalAportado);
        const desgloseFaltante = calcularDesgloseIndependiente(faltanteTotal);
        renderListaFajosFaltante(listaFajos, desgloseFaltante);
        actualizarResumenes(resumenTotal, resumenFaltante, totalObjetivo, faltanteTotal);
        resumenManual.textContent = `Aportado manual: ${formatearMoneda(totalAportado)}`;
    }

    // Eventos panel superior
    formCantidad.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const valor = Number(inputCantidad.value);

        if (!Number.isFinite(valor) || valor < 0) {
        mostrarNotificacion(contenedorNotificaciones, 'error', 'Por favor ingresa un número válido y no negativo.');
        return;
        }

        totalObjetivo = Math.floor(valor);
        mostrarNotificacion(contenedorNotificaciones, 'exito', 'Total establecido correctamente.');
        actualizarPanelSuperior();
    });

    btnLimpiar.addEventListener('click', () => {
        inputCantidad.value = '';
        totalObjetivo = 0;
        aportesManual = [];
        renderFormularioManual(listaFajosManual, DENOMINACIONES);
        listaFajos.innerHTML = '';
        actualizarResumenes(resumenTotal, resumenFaltante, 0, 0);
        resumenManual.textContent = 'Aportado manual: $0';
        mostrarNotificacion(contenedorNotificaciones, 'info', 'Se limpió todo.');
    });

    // Eventos panel manual
    formManual.addEventListener('submit', (ev) => {
        ev.preventDefault();
        aportesManual = leerYActualizarAportes(listaFajosManual);
        const totalAportado = totalAportadoManual(aportesManual);
        resumenManual.textContent = `Aportado manual: ${formatearMoneda(totalAportado)}`;

        validarAportesManual(totalObjetivo, totalAportado, contenedorNotificaciones);
        actualizarPanelSuperior();
    });

    // Actualizar subtotales y faltante en tiempo real al escribir (fajos y sueltos)
    listaFajosManual.addEventListener('input', (ev) => {
        if (
        ev.target &&
        (ev.target.classList.contains('input-fajo') || ev.target.classList.contains('input-suelto'))
        ) {
        aportesManual = leerYActualizarAportes(listaFajosManual);
        actualizarPanelSuperior();
        }
    });

    btnLimpiarManual.addEventListener('click', () => {
        renderFormularioManual(listaFajosManual, DENOMINACIONES);
        resumenManual.textContent = 'Aportado manual: $0';
        mostrarNotificacion(contenedorNotificaciones, 'info', 'Formulario manual limpiado.');
    });

    // Plegado/desplegado
    btnToggleCalculo.addEventListener('click', () => alternarPanel(panelCalculo, btnToggleCalculo));
    btnToggleManual.addEventListener('click', () => alternarPanel(panelManual, btnToggleManual));
    });



