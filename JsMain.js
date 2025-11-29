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

    document.addEventListener('DOMContentLoaded', () => {
    const contenedorNotificaciones = document.getElementById('contenedorNotificaciones');
    const formCantidad = document.getElementById('formCantidad');
    const inputCantidad = document.getElementById('cantTotal');

    const formUnico = document.getElementById('formUnico');
    const tablaDenominaciones = document.getElementById('tablaDenominaciones');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const resumenManual = document.getElementById('resumenManual');

    let totalObjetivo = 0;
    let sugerenciaInicial = [];

    // Inicializar calculadora
    initCalculadora();

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

        formUnico.classList.remove('validado', 'excedido');
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

    // Validar manual: recalcula, notifica y filtra filas ingresadas
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
        filtrarFilasIngresadas(tablaDenominaciones);
        mostrarNotificacion(contenedorNotificaciones, 'exito', 'Validación realizada. Se muestran solo las filas con valores.');
    });

    // Limpiar todo
    btnLimpiar.addEventListener('click', () => {
        tablaDenominaciones.innerHTML = '';
        resumenManual.textContent = 'Aportado manual: $0';
        totalObjetivo = 0;
        sugerenciaInicial = [];
        inputCantidad.value = '';
        formUnico.classList.remove('validado', 'excedido');
        mostrarNotificacion(contenedorNotificaciones, 'info', 'Formulario limpiado.');
    });
    });






