/**
 * DataTable.tsx — Módulo 3
 * Componente genérico de tabla de datos.
 *
 * El parámetro genérico T permite reutilizar este componente para cualquier
 * tipo de entidad sin sacrificar seguridad de tipos:
 *   <DataTable<Estudiante> datos={...} columnas={...} />
 *
 * Props:
 *   - datos: T[]                         Array de entidades a mostrar.
 *   - columnas: ColumnaTabla<T>[]        Definición de columnas.
 *   - onEditar?: (fila: T) => void       Callback opcional al editar una fila.
 *   - titulo?: string                    Título visible sobre la tabla.
 *
 * Estado de edición:
 *   Partial<T> | null — permite editar una fila sin necesidad de tener
 *   todos sus campos completados. Partial<T> es el tipo de utilidad correcto
 *   para formularios de edición donde el usuario modifica campos de forma
 *   incremental.
 */

import { useState } from "react";

// ─── Tipos de props ───────────────────────────────────────────────────────────

export interface ColumnaTabla<T> {
  /** Clave del objeto T que se renderizará en esta columna */
  clave: keyof T;
  /** Etiqueta visible en la cabecera */
  etiqueta: string;
  /** Función opcional para formatear el valor antes de mostrarlo */
  formatear?: (valor: T[keyof T]) => string;
}

type DataTablePropsModern<T extends { id: string | number }> = {
  data: T[];
  columns: ColumnaTabla<T>[];
};

type DataTablePropsLegacy<T extends { id: string | number }> = {
  datos: T[];
  columnas: ColumnaTabla<T>[];
};

export type DataTableProps<T extends { id: string | number }> = (
  | DataTablePropsModern<T>
  | DataTablePropsLegacy<T>
) & {
  titulo?: string;
  onEditar?: (fila: T) => void;
  onEliminar?: (id: T["id"]) => void;
};

function esPropsModernas<T extends { id: string | number }>(
  props: DataTableProps<T>
): props is DataTablePropsModern<T> & {
  titulo?: string;
  onEditar?: (fila: T) => void;
  onEliminar?: (id: T["id"]) => void;
} {
  return "data" in props;
}

// ─── Estado interno de edición ────────────────────────────────────────────────

interface EstadoEdicion<T> {
  filaId: string | number;
  cambios: Partial<T>;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function DataTable<T extends { id: string | number }>(props: DataTableProps<T>) {
  const { titulo, onEditar, onEliminar } = props;
  const propsComoRegistro = props as Record<string, unknown>;
  const tienePropsModernas = "data" in propsComoRegistro || "columns" in propsComoRegistro;
  const tienePropsLegadas = "datos" in propsComoRegistro || "columnas" in propsComoRegistro;

  if (tienePropsModernas && tienePropsLegadas) {
    throw new Error("DataTable recibió props modernas y legadas al mismo tiempo.");
  }

  let filas: T[];
  let columnasTabla: ColumnaTabla<T>[];

  if (esPropsModernas(props)) {
    filas = props.data;
    columnasTabla = props.columns;
  } else {
    filas = props.datos;
    columnasTabla = props.columnas;
  }

  // Estado de edición: null = sin fila en edición, Partial<T> = campos modificados
  const [edicion, setEdicion] = useState<EstadoEdicion<T> | null>(null);

  function iniciarEdicion(fila: T): void {
    setEdicion({ filaId: fila.id, cambios: { ...fila } });
  }

  function actualizarCampo(clave: keyof T, valor: string): void {
    if (!edicion) return;
    setEdicion({
      ...edicion,
      cambios: { ...edicion.cambios, [clave]: valor },
    });
  }

  function confirmarEdicion(filaOriginal: T): void {
    if (!edicion || !onEditar) return;
    onEditar({ ...filaOriginal, ...edicion.cambios });
    setEdicion(null);
  }

  function cancelarEdicion(): void {
    setEdicion(null);
  }

  const hayAcciones = Boolean(onEditar || onEliminar);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1rem" }}>
      {titulo && (
        <h2 style={{ marginBottom: "0.75rem", fontSize: "1.25rem", fontWeight: "bold" }}>
          {titulo}
        </h2>
      )}

      {filas.length === 0 ? (
        <p style={{ color: "#6b7280", fontStyle: "italic" }}>Sin datos disponibles.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
                {columnasTabla.map((col) => (
                  <th
                    key={String(col.clave)}
                    style={{ padding: "0.6rem 1rem", borderBottom: "2px solid #e5e7eb" }}
                  >
                    {col.etiqueta}
                  </th>
                ))}
                {hayAcciones && (
                  <th style={{ padding: "0.6rem 1rem", borderBottom: "2px solid #e5e7eb" }}>
                    Acciones
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filas.map((fila) => {
                const estaEditando = edicion?.filaId === fila.id;

                return (
                  <tr
                    key={String(fila.id)}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      backgroundColor: estaEditando ? "#eff6ff" : "white",
                    }}
                  >
                    {columnasTabla.map((col) => (
                      <td key={String(col.clave)} style={{ padding: "0.6rem 1rem" }}>
                        {estaEditando ? (
                          <input
                            defaultValue={String(fila[col.clave] ?? "")}
                            onChange={(e) => actualizarCampo(col.clave, e.target.value)}
                            style={{
                              border: "1px solid #93c5fd",
                              borderRadius: "4px",
                              padding: "0.2rem 0.4rem",
                              width: "100%",
                            }}
                          />
                        ) : col.formatear ? (
                          col.formatear(fila[col.clave])
                        ) : (
                          String(fila[col.clave] ?? "")
                        )}
                      </td>
                    ))}

                    {hayAcciones && (
                      <td style={{ padding: "0.6rem 1rem", whiteSpace: "nowrap" }}>
                        {estaEditando ? (
                          <>
                            <button
                              onClick={() => confirmarEdicion(fila)}
                              style={{ marginRight: "0.5rem", color: "green", cursor: "pointer" }}
                            >
                              Guardar
                            </button>
                            <button onClick={cancelarEdicion} style={{ color: "#6b7280", cursor: "pointer" }}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            {onEditar && (
                              <button
                                onClick={() => iniciarEdicion(fila)}
                                style={{ marginRight: "0.5rem", color: "#2563eb", cursor: "pointer" }}
                              >
                                Editar
                              </button>
                            )}
                            {onEliminar && (
                              <button
                                onClick={() => onEliminar(fila.id)}
                                style={{ color: "#dc2626", cursor: "pointer" }}
                              >
                                Eliminar
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
