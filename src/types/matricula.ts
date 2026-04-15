/**
 * matricula.ts — Módulo 3 (React)
 * Tipos reutilizados del Módulo 2 y extendidos con exhaustiveness check.
 * Esta copia es independiente (no se anidan repositorios).
 */

export interface Asignatura {
  id: string;
  nombre: string;
  creditos: number;
  departamento: string;
  profesorResponsable: string;
}

export interface MatriculaActiva {
  tipo: "ACTIVA";
  asignaturas: Asignatura[];
  fechaInicio: Date;
}

export interface MatriculaSuspendida {
  tipo: "SUSPENDIDA";
  motivo: string;
  fechaSuspension: Date;
  reactivableEn?: Date;
}

export interface MatriculaFinalizada {
  tipo: "FINALIZADA";
  notaMedia: number;
  fechaFinalizacion: Date;
  titulacionObtenida: string;
}

export type EstadoMatricula =
  | MatriculaActiva
  | MatriculaSuspendida
  | MatriculaFinalizada;

/**
 * generarReporte — versión Módulo 3 con exhaustiveness check.
 *
 * El bloque `default` asigna el valor no manejado a una variable de tipo
 * `never`. Si en el futuro se añade una nueva variante a EstadoMatricula sin
 * actualizar este switch, TypeScript emitirá un error de compilación antes
 * de que el código llegue a producción.
 */
export function generarReporte(estado: EstadoMatricula): string {
  switch (estado.tipo) {
    case "ACTIVA":
      return (
        `Matrícula ACTIVA desde ${estado.fechaInicio.toLocaleDateString("es-ES")}. ` +
        `Asignaturas: ${estado.asignaturas.map((a) => a.nombre).join(", ")}.`
      );

    case "SUSPENDIDA":
      return (
        `Matrícula SUSPENDIDA el ${estado.fechaSuspension.toLocaleDateString("es-ES")}. ` +
        `Motivo: ${estado.motivo}.`
      );

    case "FINALIZADA":
      return (
        `Matrícula FINALIZADA. Titulación: ${estado.titulacionObtenida}. ` +
        `Nota media: ${estado.notaMedia.toFixed(2)}.`
      );

    default: {
      // Si se añade un nuevo estado a EstadoMatricula sin añadir su case,
      // TypeScript marcará este bloque como error: Type 'X' is not assignable to type 'never'.
      const comprobacionExhaustiva: never = estado;
      throw new Error(
        `Estado de matrícula no manejado: ${JSON.stringify(comprobacionExhaustiva)}`
      );
    }
  }
}
