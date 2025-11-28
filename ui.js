// js/ui.js
import { formatearMoneda, calcularDesgloseIndependiente } from './Contabilizador.js';

/* Emojis por denominación */
const emojiPorDenominacion = {
    1000: '💵', 500: '💵', 200: '💵', 100: '💵',
    50: '💵', 20: '💵', 10: '💵', 5: '💵', 3: '💵', 1: '💵'
    };

    /**
     * Renderiza la tabla base (Denominaciones | Faltante | Manual).
     */
    export function renderTablaUnica(contenedor, denominaciones) {
    contenedor.innerHTML = '';

    denominaciones.forEach((denom) => {
        const emoji = emojiPorDenominacion[denom] || '💵';

        const fila = document.createElement('div');
        fila.className = 'fila';
        fila.dataset.denominacion = String(denom);

        fila.innerHTML = `
        <!-- Columna 1: Denominaciones -->
        <div class="celda columna-denominacion">
            <div class="bloque-fajo">
            <div class="titulo">${emoji} $${denom}</div>
            <div class="linea"><span>Fajos (100):</span><span class="valor denom-fajos">0</span></div>
            <div class="linea"><span>Billetes sueltos:</span><span class="valor denom-sueltos">0</span></div>
            </div>
        </div>

        <!-- Columna 2: Faltante (por denominación) -->
        <div class="celda columna-faltante">
            <input type="text" class="input-faltante-fajos" value="0" readonly />
            <input type="text" class="input-faltante-sueltos" value="0" readonly />
        </div>

        <!-- Columna 3: Validación manual -->
        <div class="celda columna-manual">
            <div class="grupo-vertical">
            <input type="number" min="0" step="1" value="0"
                class="input-fajo" data-denominacion="${denom}" aria-label="Fajos ${denom}" />
            <input type="number" min="0" step="1" value="0"
                class="input-suelto" data-denominacion="${denom}" aria-label="Sueltos ${denom}" />
            </div>
        </div>
        `;

        contenedor.appendChild(fila);
    });
    }

    /**
     * Fija las sugerencias iniciales en Denominaciones y el faltante inicial.
     */
    export function setSugerenciaInicial(contenedor, desglose) {
    const byDenom = new Map();
    desglose.forEach(it => byDenom.set(Number(it.denominacion), it));

    contenedor.querySelectorAll('.fila').forEach(fila => {
        const denom = Number(fila.dataset.denominacion);
        const it = byDenom.get(denom) || { fajos: 0, sueltos: 0 };

        fila.querySelector('.denom-fajos').textContent = String(it.fajos);
        fila.querySelector('.denom-sueltos').textContent = String(it.sueltos);

        fila.querySelector('.input-faltante-fajos').value = String(it.fajos);
        fila.querySelector('.input-faltante-sueltos').value = String(it.sueltos);
    });
    }

    /**
     * Actualiza en tiempo real:
     * - Calcula el total manual ingresado.
     * - Recalcula el faltante por denominación (fajos y sueltos) en función del dinero restante.
     * - Notifica faltante, validación o exceso.
     * - Cambia color de la tabla según estado.
     */
    export function actualizarTabla(contenedorTabla, totalObjetivo, necesarioInicial, nodoResumenManual, nodoTablaFormulario, contenedorNotificaciones) {
    const filas = contenedorTabla.querySelectorAll('.fila');
    let totalManual = 0;

    // Calcular total manual ingresado
    filas.forEach(fila => {
        const denom = Number(fila.dataset.denominacion);
        const fajos = Math.max(0, Math.floor(Number(fila.querySelector('.input-fajo')?.value) || 0));
        const sueltos = Math.max(0, Math.floor(Number(fila.querySelector('.input-suelto')?.value) || 0));

        const subtotal = (fajos * 100 + sueltos) * denom;
        totalManual += subtotal;
    });

    if (nodoResumenManual) {
        nodoResumenManual.textContent = `Aportado manual: ${formatearMoneda(totalManual)}`;
    }

    if (Number.isFinite(totalObjetivo) && totalObjetivo > 0) {
        const dineroFaltante = totalObjetivo - totalManual;

        // Recalcular desglose del dinero faltante en fajos/sueltos por denominación
        let desgloseFaltante = [];
        if (dineroFaltante > 0) {
        desgloseFaltante = calcularDesgloseIndependiente(dineroFaltante);
        }

        const faltMap = new Map();
        desgloseFaltante.forEach(it => faltMap.set(Number(it.denominacion), it));

        filas.forEach(fila => {
        const denom = Number(fila.dataset.denominacion);
        const it = faltMap.get(denom) || { fajos: 0, sueltos: 0 };
        fila.querySelector('.input-faltante-fajos').value = String(it.fajos);
        fila.querySelector('.input-faltante-sueltos').value = String(it.sueltos);
        });

        // Notificaciones y colores
        Array.from(contenedorNotificaciones.querySelectorAll('.toast')).forEach(t => t.remove());

        if (dineroFaltante > 0) {
        mostrarNotificacion(contenedorNotificaciones, 'info', `Falta por validar: ${formatearMoneda(dineroFaltante)}`, 1200);
        nodoTablaFormulario?.classList.remove('validado', 'excedido');
        } else if (dineroFaltante === 0) {
        mostrarNotificacion(contenedorNotificaciones, 'exito', 'Cantidad completa validada.', 1500);
        nodoTablaFormulario?.classList.add('validado');
        nodoTablaFormulario?.classList.remove('excedido');
        } else {
        mostrarNotificacion(contenedorNotificaciones, 'error', `Has excedido el total en ${formatearMoneda(Math.abs(dineroFaltante))}`, 1500);
        nodoTablaFormulario?.classList.add('excedido');
        nodoTablaFormulario?.classList.remove('validado');
        // En exceso, ponemos faltante en 0
        filas.forEach(fila => {
            fila.querySelector('.input-faltante-fajos').value = "0";
            fila.querySelector('.input-faltante-sueltos').value = "0";
        });
        }
    }
    }

    /** Notificación tipo toast */
    export function mostrarNotificacion(contenedor, tipo, mensaje, duracionMs = 2200) {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    contenedor.appendChild(toast);
    setTimeout(() => toast.remove(), duracionMs);
    }








