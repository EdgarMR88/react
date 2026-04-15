/**
 * fechas.ts — Módulo 3
 * Utilidades de fechas usando date-fns.
 * date-fns incluye sus propios tipos TypeScript — no requiere @types/date-fns.
 *
 * Todas las funciones tienen firmas estrictamente tipadas: entradas y
 * salidas declaradas explícitamente para que TypeScript verifique el
 * contrato en el punto de uso.
 */

import { differenceInDays, differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Calcula la diferencia en días entre dos fechas.
 * El resultado es positivo si `fechaFin` es posterior a `fechaInicio`,
 * negativo si es anterior.
 *
 * @param fechaInicio - Fecha de inicio.
 * @param fechaFin    - Fecha de fin.
 * @returns Número de días de diferencia (puede ser negativo).
 */
export function diferenciaDias(fechaInicio: Date, fechaFin: Date): number {
  return differenceInDays(fechaFin, fechaInicio);
}

/**
 * Calcula la diferencia en días de calendario entre dos fechas.
 * A diferencia de `diferenciaDias`, ignora la hora del día.
 */
export function diferenciaDiasCalendario(fechaInicio: Date, fechaFin: Date): number {
  return differenceInCalendarDays(fechaFin, fechaInicio);
}

/**
 * Formatea una fecha para su visualización en español.
 * @param fecha   - Fecha a formatear.
 * @param patron  - Patrón date-fns (por defecto: "dd 'de' MMMM 'de' yyyy").
 * @returns Cadena de texto formateada.
 */
export function formatearFecha(fecha: Date, patron = "dd 'de' MMMM 'de' yyyy"): string {
  return format(fecha, patron, { locale: es });
}

/**
 * Parsea una cadena ISO y devuelve un Date o null si no es válida.
 * Permite manejar fechas que llegan como strings desde una API.
 */
export function parsearFechaISO(iso: string): Date | null {
  const fecha = parseISO(iso);
  return isValid(fecha) ? fecha : null;
}

/**
 * Devuelve una descripción humanizada de la diferencia entre dos fechas.
 */
export function descripcionDiferencia(fechaInicio: Date, fechaFin: Date): string {
  const dias = Math.abs(diferenciaDiasCalendario(fechaInicio, fechaFin));
  const esPasado = diferenciaDiasCalendario(fechaInicio, fechaFin) < 0;

  if (dias === 0) return "hoy";
  if (dias === 1) return esPasado ? "ayer" : "mañana";
  if (dias < 7)  return esPasado ? `hace ${dias} días` : `en ${dias} días`;
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return esPasado
      ? `hace ${semanas} semana${semanas > 1 ? "s" : ""}`
      : `en ${semanas} semana${semanas > 1 ? "s" : ""}`;
  }
  const meses = Math.floor(dias / 30);
  return esPasado
    ? `hace ${meses} mes${meses > 1 ? "es" : ""}`
    : `en ${meses} mes${meses > 1 ? "es" : ""}`;
}
