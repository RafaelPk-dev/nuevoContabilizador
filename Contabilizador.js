  // Reglas: cálculo independiente por denominación.
// Un fajo contiene 100 billetes de la misma denominación.

export const DENOMINACIONES = [1000, 500, 200, 100, 50, 20, 10, 5, 3, 1];

/**
 * Devuelve desglose independiente por denominación sobre un total dado.
 * Si se usara solo esa denominación:
 *  - billetesNecesarios = floor(total / denom)
 *  - fajos = floor(billetesNecesarios / 100)
 *  - sueltos = billetesNecesarios % 100
 *  - subtotal = billetesNecesarios * denom
 */
    export function calcularDesgloseIndependiente(total) {
    const t = Number.isFinite(total) ? Math.floor(total) : 0;
    const salida = [];

    for (const denom of DENOMINACIONES) {
        const billetesNecesarios = Math.floor(t / denom);
        const fajos = Math.floor(billetesNecesarios / 100);
        const sueltos = billetesNecesarios % 100;
        const subtotal = billetesNecesarios * denom;

        salida.push({
        denominacion: denom,
        billetesNecesarios,
        fajos,
        sueltos,
        subtotal
        });
    }
    return salida;
    }

/** Formatea dinero simple */
export function formatearMoneda(n) { return `$${n}`; }

/**
 * Calcula el total aportado por el formulario manual
 * a partir de fajos y billetes sueltos por denominación.
 */
export function totalAportadoManual(aportes) {
  // aportes: [{denominacion, fajos, sueltos}]
  return aportes.reduce((acc, a) => acc + (a.fajos * 100 + a.sueltos) * a.denominacion, 0);
}

