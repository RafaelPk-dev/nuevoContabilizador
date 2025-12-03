    import { formatearMoneda, calcularDesgloseIndependiente } from './Contabilizador.js';
    import { parseCantidadFormateada } from './fromateoMillar.js'; // ✅ añade esta importación
    /* Emojis por denominación */
    const emojiPorDenominacion = {
    1000: '💵', 500: '💵', 200: '💵', 100: '💵',
    50: '💵', 20: '💵', 10: '💵', 5: '💵', 3: '💵', 1: '💵'
    };

    /* Tabla base */
    export function renderTablaUnica(contenedor, denominaciones) {
    contenedor.innerHTML = '';
    denominaciones.forEach((denom) => {
        const emoji = emojiPorDenominacion[denom] || '💵';
        const fila = document.createElement('div');
        fila.className = 'fila';
        fila.dataset.denominacion = String(denom);
        fila.innerHTML = `
        <div class="celda columna-denominacion">
            <div class="bloque-fajo">
            <div class="titulo">${emoji} $${denom}</div>
            <div class="linea"><span>Fajos:</span><span class="valor denom-fajos">0</span></div>
            <div class="linea"><span>Billetes:</span><span class="valor denom-sueltos">0</span></div>
            </div>
        </div>
        <div class="celda columna-faltante">
            <input type="text" class="input-faltante-fajos" readonly />
            <input type="text" class="input-faltante-sueltos" readonly />
        </div>
        <div class="celda columna-manual">
            <div class="grupo-vertical">
            <input type="number" min="0" step="1"
                class="input-fajo" data-denominacion="${denom}" aria-label="Fajos ${denom}" />
            <input type="number" min="0" step="1"
                class="input-suelto" data-denominacion="${denom}" aria-label="Sueltos ${denom}" />
            </div>
        </div>
        `;
        contenedor.appendChild(fila);
    });
    }

    /* Sugerencia inicial */
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

    /* Actualización en tiempo real */
    export function actualizarTabla(
    contenedorTabla,
    totalObjetivo,
    necesarioInicial,
    nodoResumenManual,
    nodoTablaFormulario,
    contenedorNotificaciones
    ) {
    const filas = contenedorTabla.querySelectorAll('.fila');
    let totalManual = 0;

    filas.forEach(fila => {
        const denom = Number(fila.dataset.denominacion);
        const fajos = Math.max(0, Math.floor(Number(fila.querySelector('.input-fajo')?.value) || 0));
        const sueltos = Math.max(0, Math.floor(Number(fila.querySelector('.input-suelto')?.value) || 0));
        totalManual += (fajos * 100 + sueltos) * denom;
    });

  // ✅ Actualizar bloque header
    const infoAportado = document.getElementById('infoAportado');
    if (infoAportado) {
        infoAportado.textContent = `Aportado: ${formatearMoneda(totalManual)}`;
    }

    if (Number.isFinite(totalObjetivo) && totalObjetivo > 0) {
        const dineroFaltante = totalObjetivo - totalManual;

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

        // ✅ Actualizar bloque header faltante
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

        // Notificaciones visuales
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

    

    /* Filtrar filas vacías */
    export function filtrarFilasIngresadas(contenedorTabla) {
    const filas = contenedorTabla.querySelectorAll('.fila');
    filas.forEach(fila => {
        const fajos = Number(fila.querySelector('.input-fajo')?.value) || 0;
        const sueltos = Number(fila.querySelector('.input-suelto')?.value) || 0;
        if (fajos === 0 && sueltos === 0) fila.remove();
    });
    }

    /* Toast */
    export function mostrarNotificacion(contenedor, tipo, mensaje, duracionMs = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    contenedor.appendChild(toast);
    setTimeout(() => toast.remove(), duracionMs);
    }

    /* Calculadora: lógica y reflejo en cantTotal en tiempo real */
        export function initCalculadora() {
    const calcContainer = document.getElementById('calcContainer');
    const calcDisplay = document.getElementById('calcDisplay');
    const calcResult = document.getElementById('calcResult'); // ✅ span principal
    const inputCantidad = document.getElementById('cantTotal'); // ✅ input en el header
    const buttons = calcContainer?.querySelectorAll('.calc-btn') || [];

    let currentExpression = "";

    function formatearComillasMillar(n) {
        return Number(n).toLocaleString('es-ES').replace(/\./g, "'");
    }

    function actualizarDisplay() {
        calcDisplay.value = currentExpression;
        try {
        const subtotal = eval(currentExpression.replace(/×/g, '*').replace(/÷/g, '/'));
        if (!isNaN(subtotal)) {
            calcDisplay.value = `${currentExpression} = ${subtotal}`;

            // ✅ Mostrar en el span principal
            if (calcResult) {
            calcResult.textContent = formatearComillasMillar(Math.floor(subtotal));
            }

            // ✅ Reflejar también en el header
            if (inputCantidad) {
            inputCantidad.value = formatearComillasMillar(Math.floor(subtotal));
            }
        }
        } catch {
        if (calcResult) calcResult.textContent = "...";
        calcDisplay.value = currentExpression;
        }
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
        const value = btn.dataset.value;

        if (btn.id === "calcClear") {
            currentExpression = "";
        } else if (btn.id === "calcBackspace") {
            currentExpression = currentExpression.slice(0, -1);
        } else if (btn.id === "calcEquals") {
            try {
            currentExpression = eval(currentExpression.replace(/×/g, '*').replace(/÷/g, '/')).toString();
            } catch {
            currentExpression = "Error";
            }
        } else if (btn.id === "calcClose") {
            calcContainer.classList.remove("activa");
            document.getElementById('overlayBlur')?.classList.add('oculto');
            return;
        } else {
            currentExpression += value;
        }

        actualizarDisplay();
        });
    });
}


    /* UI de calculadora: overlay blur y toggle bottom sheet */
    export function bindCalculatorUI() {
    const btnCalc = document.getElementById('btnCalc');
    const calcContainer = document.getElementById('calcContainer');
    const overlay = document.getElementById('overlayBlur');
    const btnClose = document.getElementById('calcClose');

    if (!btnCalc || !calcContainer || !overlay) return;

    btnCalc.addEventListener('click', () => {
        calcContainer.classList.toggle('activa');
        overlay.classList.toggle('oculto');
    });

    if (btnClose) {
        btnClose.addEventListener('click', () => {
        calcContainer.classList.remove('activa');
        overlay.classList.add('oculto');
        });
    }

    overlay.addEventListener('click', () => {
        calcContainer.classList.remove('activa');
        overlay.classList.add('oculto');
    });
    }

    
    /* UI de menú moneda: overlay blur y toggle bottom sheet */
    export function bindMonedaUI() {
    const btnMoneda = document.getElementById('btnMoneda');
    const menuMoneda = document.getElementById('menuMoneda');
    const overlay = document.getElementById('overlayBlur');
    const btnClose = document.getElementById('monedaClose');
    const selectMoneda = document.getElementById('selectMoneda');
    const inputMoneda = document.getElementById('inputMoneda');
    const inputCantidad = document.getElementById('cantTotal');

    const inputTasa = document.getElementById('inputTasa');
    const btnGuardarTasa = document.getElementById('btnGuardarTasa');
    const resultadoInverso = document.getElementById('resultadoInverso');

    if (!btnMoneda || !menuMoneda || !overlay) return;

    // Abrir/cerrar menú
    btnMoneda.addEventListener('click', () => {
        menuMoneda.classList.toggle('activa');
        overlay.classList.toggle('oculto');
        cargarTasa();
        actualizarConversionInversa(); // mostrar al abrir
    });
    if (btnClose) {
        btnClose.addEventListener('click', () => {
        menuMoneda.classList.remove('activa');
        overlay.classList.add('oculto');
        });
    }
    overlay.addEventListener('click', () => {
        menuMoneda.classList.remove('activa');
        overlay.classList.add('oculto');
    });

    // Conversión directa (moneda → pesos)
    function aplicarConversionMoneda() {
        const cantidadMoneda = parseFloat(inputMoneda.value);
        if (!Number.isFinite(cantidadMoneda) || cantidadMoneda <= 0) return;
        const tasa = obtenerTasa(selectMoneda.value);
        const convertido = Math.floor(cantidadMoneda * tasa);
        inputCantidad.value = Number(convertido).toLocaleString('es-ES').replace(/\./g, "'");
        actualizarConversionInversa();
    }
    selectMoneda.addEventListener('change', () => {
        cargarTasa();
        aplicarConversionMoneda();
    });
    inputMoneda.addEventListener('input', aplicarConversionMoneda);

    // Guardar tasa y notificar
    if (btnGuardarTasa) {
        btnGuardarTasa.addEventListener('click', () => {
        const valor = parseFloat(inputTasa.value);
        if (!Number.isFinite(valor) || valor <= 0) return;
        localStorage.setItem(`tasa_${selectMoneda.value}`, valor);
        mostrarNotificacion(
            document.getElementById('contenedorNotificaciones'),
            'exito',
            `Tasa de ${selectMoneda.value} guardada: ${valor}`,
            3000
        );
        actualizarConversionInversa();
        aplicarConversionMoneda(); // si hay una cantidad de moneda escrita, que se recalcule con la nueva tasa
        });
    }

    // Conversión inversa (pesos → moneda) usando parseCantidadFormateada
    function actualizarConversionInversa() {
        if (!resultadoInverso || !inputCantidad) return;
        const valorPesos = parseCantidadFormateada(String(inputCantidad.value)); // ✅ ahora sí parsea comillas y espacios
        if (!Number.isFinite(valorPesos) || valorPesos <= 0) {
        resultadoInverso.textContent = "Equivalente: -";
        return;
        }
        const tasa = obtenerTasa(selectMoneda.value);
        const convertido = (valorPesos / tasa).toFixed(2);
        resultadoInverso.textContent = `Equivalente: ${convertido} ${selectMoneda.value}`;
    }

    // Escuchar cambios en cantTotal y moneda seleccionada
    inputCantidad.addEventListener('input', actualizarConversionInversa);
    selectMoneda.addEventListener('change', actualizarConversionInversa);

    // Auxiliares
    function obtenerTasa(moneda) {
        const guardada = localStorage.getItem(`tasa_${moneda}`);
        if (guardada && !isNaN(parseFloat(guardada)) && parseFloat(guardada) > 0) {
        return parseFloat(guardada);
        }
        return moneda === 'USD' ? 450 : 500;
    }

    function cargarTasa() {
        inputTasa.value = obtenerTasa(selectMoneda.value);
    }
}















