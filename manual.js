    import { mostrarNotificacion } from './ui.js';
import { formatearMoneda } from './Contabilizador.js';

/**
 * Valida y notifica según el total esperado y el total aportado manualmente.
 * Además devuelve un objeto con el estado para que main.js actualice el panel superior.
 */
export function validarAportesManual(totalEsperado, totalAportado, contenedorNotificaciones) {
    if (!Number.isFinite(totalEsperado) || totalEsperado <= 0) {
        mostrarNotificacion(contenedorNotificaciones, 'error', 'Ingresa primero la cantidad total en el formulario superior.');
        return { estado: 'sin_total' };
    }

    if (totalAportado === totalEsperado) {
        mostrarNotificacion(contenedorNotificaciones, 'exito', 'Cantidad cumplida exactamente.');
        return { estado: 'exacto', faltante: 0, mensaje: `Cumplido: ${formatearMoneda(totalEsperado)}` };
    } else if (totalAportado < totalEsperado) {
        const faltante = totalEsperado - totalAportado;
        mostrarNotificacion(contenedorNotificaciones, 'error', `Falta dinero: faltan ${formatearMoneda(faltante)}.`);
        return { estado: 'falta', faltante };
    } else {
        const exceso = totalAportado - totalEsperado;
        mostrarNotificacion(contenedorNotificaciones, 'error', `Exceso de dinero: sobran ${formatearMoneda(exceso)}.`);
        return { estado: 'exceso', excedente: exceso };
    }
    }

    /** Alterna visibilidad de un panel con animación (clase .oculto) */
    export function alternarPanel(panelEl, botonEl) {
    const oculto = panelEl.classList.toggle('oculto');
    if (botonEl) {
        botonEl.textContent = oculto ? 'Mostrar' : 'Ocultar';
        botonEl.setAttribute('aria-expanded', (!oculto).toString());
    }
    }

