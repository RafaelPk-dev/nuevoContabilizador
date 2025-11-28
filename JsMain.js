// js/main.js
import { DENOMINACIONES, calcularDesgloseIndependiente } from './Contabilizador.js';
import {
    renderTablaUnica,
    setSugerenciaInicial,
    actualizarTabla,
    mostrarNotificacion
    } from './ui.js';

    document.addEventListener('DOMContentLoaded', () => {
    const contenedorNotificaciones = document.getElementById('contenedorNotificaciones');
    const formCantidad = document.getElementById('formCantidad');
    const inputCantidad = document.getElementById('cantTotal');

    const formUnico = document.getElementById('formUnico');
    const tablaDenominaciones = document.getElementById('tablaDenominaciones');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const resumenManual = document.getElementById('resumenManual');

    let totalObjetivo = 0;
    let sugerenciaInicial = []; // [{denominacion, fajos, sueltos, subtotal}]

    // Establecer total objetivo y renderizar tabla
    formCantidad.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const valor = Number(inputCantidad.value);

        if (!Number.isFinite(valor) || valor < 0) {
        mostrarNotificacion(contenedorNotificaciones, 'error', 'Por favor ingresa un número válido.');
        return;
        }

        totalObjetivo = Math.floor(valor);
        sugerenciaInicial = calcularDesgloseIndependiente(totalObjetivo);

        renderTablaUnica(tablaDenominaciones, DENOMINACIONES);
        setSugerenciaInicial(tablaDenominaciones, sugerenciaInicial);

        // Reset visual
        formUnico.classList.remove('validado');
        resumenManual.textContent = 'Aportado manual: $0';
        mostrarNotificacion(contenedorNotificaciones, 'exito', 'Total establecido correctamente.');
    });

    // Actualizaciones en tiempo real al escribir en manual
    formUnico.addEventListener('input', (ev) => {
        if (ev.target.classList.contains('input-fajo') || ev.target.classList.contains('input-suelto')) {
        actualizarTabla(
            tablaDenominaciones,
            totalObjetivo,
            sugerenciaInicial,
            resumenManual,
            formUnico,
            contenedorNotificaciones
        );
        }
    });

    // Validar manual (opcional)
    formUnico.addEventListener('submit', (ev) => {
        ev.preventDefault();
        actualizarTabla(
        tablaDenominaciones,
        totalObjetivo,
        sugerenciaInicial,
        resumenManual,
        formUnico,
        contenedorNotificaciones
        );
        mostrarNotificacion(contenedorNotificaciones, 'exito', 'Validación realizada.');
    });

    // Limpiar todo
    btnLimpiar.addEventListener('click', () => {
        tablaDenominaciones.innerHTML = '';
        resumenManual.textContent = 'Aportado manual: $0';
        totalObjetivo = 0;
        sugerenciaInicial = [];
        inputCantidad.value = '';
        formUnico.classList.remove('validado');
        mostrarNotificacion(contenedorNotificaciones, 'info', 'Formulario limpiado.');
    });
    });




