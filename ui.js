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

        <!-- Columna 2: Faltante -->
        <div class="celda columna-faltante">
            <input type="text" class="input-faltante-fajos" placeholder="" readonly />
            <input type="text" class="input-faltante-sueltos" placeholder="" readonly />
        </div>

        <!-- Columna 3: Validación manual -->
        <div class="celda columna-manual">
            <div class="grupo-vertical">
            <input type="number" min="0" step="1"
                class="input-fajo" data-denominacion="${denom}" aria-label="Fajos ${denom}" placeholder="" />
            <input type="number" min="0" step="1"
                class="input-suelto" data-denominacion="${denom}" aria-label="Sueltos ${denom}" placeholder="" />
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
     * - Recalcula el faltante por denominación.
     * - Actualiza los divs #infoAportado y #infoFaltante en el header.
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

    // Actualizar div de aportado manual en header
    const infoAportado = document.getElementById('infoAportado');
    if (infoAportado) {
        infoAportado.textContent = `Aportado manual: ${formatearMoneda(totalManual)}`;
    }

    if (Number.isFinite(totalObjetivo) && totalObjetivo > 0) {
        const dineroFaltante = totalObjetivo - totalManual;

        // Recalcular desglose del dinero faltante
        let desgloseFaltante = [];
        if (dineroFaltante > 0) {
        desgloseFaltante = calcularDesgloseIndependiente(dineroFaltante);
        }

        const faltMap = new Map();
        desgloseFaltante.forEach(it => faltMap.set(Number(it.denominacion), it));

        filas.forEach(fila => {
        const denom = Number(fila.dataset.denominacion);
        const it = faltMap.get(denom) || { fajos: 0, sueltos: 0 };
        fila.querySelector('.input-faltante-fajos').value = it.fajos ? String(it.fajos) : "";
        fila.querySelector('.input-faltante-sueltos').value = it.sueltos ? String(it.sueltos) : "";
        });

        // Actualizar div de faltante en header
        const infoFaltante = document.getElementById('infoFaltante');
        if (infoFaltante) {
        if (dineroFaltante > 0) {
            infoFaltante.textContent = `Faltante: ${formatearMoneda(dineroFaltante)}`;
        } else if (dineroFaltante === 0) {
            infoFaltante.textContent = `Faltante: $0 (Meta alcanzada)`;
        } else {
            infoFaltante.textContent = `Excedido en: ${formatearMoneda(Math.abs(dineroFaltante))}`;
        }
        }

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
        filas.forEach(fila => {
            fila.querySelector('.input-faltante-fajos').value = "";
            fila.querySelector('.input-faltante-sueltos').value = "";
        });
        }
    }
    }

    /**
     * Nueva funcionalidad: al validar, limpiar filas sin valores y dejar solo las ingresadas.
     */
    export function filtrarFilasIngresadas(contenedorTabla) {
    const filas = contenedorTabla.querySelectorAll('.fila');
    filas.forEach(fila => {
        const fajos = Number(fila.querySelector('.input-fajo')?.value) || 0;
        const sueltos = Number(fila.querySelector('.input-suelto')?.value) || 0;
        if (fajos === 0 && sueltos === 0) {
        fila.remove(); // eliminar fila sin valores
        }
    });
    }

    /** Notificación tipo toast */
    export function mostrarNotificacion(contenedor, tipo, mensaje, duracionMs =30000) {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    contenedor.appendChild(toast);
    setTimeout(() => toast.remove(),4000);
    }

    /**
     * Inicializa la calculadora simple.
     * Al calcular, inserta el resultado en el input #cantTotal automáticamente.
     */
    // ui.js

    export function initCalculadora() {
    const calcContainer = document.getElementById('calcContainer');
    const calcDisplay = document.getElementById('calcDisplay');
    const buttons = calcContainer.querySelectorAll('.calc-btn');
    let currentExpression = "";

    function actualizarDisplay() {
        calcDisplay.value = currentExpression;
        try {
        // Evaluar subtotal en tiempo real
        const subtotal = eval(currentExpression.replace(/×/g, '*').replace(/÷/g, '/'));
        if (!isNaN(subtotal)) {
            calcDisplay.value = `${currentExpression} = ${subtotal}`;
        }
        } catch (e) {
        // Si la expresión aún no es válida, solo mostrar lo escrito
        calcDisplay.value = currentExpression;
        }
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
        const value = btn.dataset.value;

        if (btn.id === "calcClear") {
            currentExpression = "";
        } else if (btn.id === "calcEquals") {
            try {
            currentExpression = eval(currentExpression.replace(/×/g, '*').replace(/÷/g, '/')).toString();
            } catch (e) {
            currentExpression = "Error";
            }
        } else if (btn.id === "calcClose") {
            calcContainer.classList.add("oculto");
            return;
        } else {
            currentExpression += value;
        }

        actualizarDisplay();
        });
    });

    // Mostrar la calculadora centrada
    calcContainer.classList.remove("oculto");
    }











