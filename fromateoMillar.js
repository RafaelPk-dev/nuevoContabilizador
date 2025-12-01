        // js/doc.js
    export function initFormateoMillares(inputCantidad) {
    if (!inputCantidad) return;

    inputCantidad.addEventListener('input', () => {
        // Tomar solo dígitos
        const raw = inputCantidad.value.replace(/[^0-9]/g, '');
        if (raw === '') {
        inputCantidad.value = '';
        return;
        }

        // Convertir a número y formatear
        const num = parseInt(raw, 10);
        if (isNaN(num)) {
        inputCantidad.value = '';
        return;
        }

        // Formatear con comillas de millar
        const formateado = num.toLocaleString('es-ES').replace(/\./g, "'");
        inputCantidad.value = formateado;
    });
    }

    export function parseCantidadFormateada(valorStr) {
    if (!valorStr) return 0;
    return Number(valorStr.replace(/'/g, '').replace(/\./g, ''));
    }

