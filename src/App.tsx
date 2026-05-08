/**
 * App.tsx — Módulo 3
 * Integra DataTable<T>, utils de fechas y tipos de matrícula en una demo
 * completa que muestra el valor del tipado estricto en React.
 */

import { useState } from "react";
import { DataTable, type ColumnaTabla } from "./components/DataTable";
import { generarReporte, type EstadoMatricula } from "./types/matricula";
import {
  diferenciaDiasCalendario,
  formatearFecha,
  descripcionDiferencia,
} from "./utils/fechas";

// ─── Tipos de demo ────────────────────────────────────────────────────────────

interface Estudiante {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  notaMedia: number;
  fechaIngreso: Date;
}

// ─── Datos iniciales ──────────────────────────────────────────────────────────

const estudiantesIniciales: Estudiante[] = [
  {
    id: "EST-001",
    nombre: "Ana",
    apellidos: "Rodríguez Pérez",
    email: "ana@universidad.es",
    notaMedia: 8.4,
    fechaIngreso: new Date("2023-09-01"),
  },
  {
    id: "EST-002",
    nombre: "Carlos",
    apellidos: "Fernández Díaz",
    email: "carlos@universidad.es",
    notaMedia: 7.1,
    fechaIngreso: new Date("2022-09-01"),
  },
  {
    id: "EST-003",
    nombre: "María",
    apellidos: "López Sánchez",
    email: "maria@universidad.es",
    notaMedia: 9.2,
    fechaIngreso: new Date("2024-09-01"),
  },
];

const columnasEstudiante: ColumnaTabla<Estudiante>[] = [
  { clave: "nombre",     etiqueta: "Nombre" },
  { clave: "apellidos",  etiqueta: "Apellidos" },
  { clave: "email",      etiqueta: "Email" },
  {
    clave: "notaMedia",
    etiqueta: "Nota media",
    formatear: (v) => `${Number(v).toFixed(2)} / 10`,
  },
  {
    clave: "fechaIngreso",
    etiqueta: "Ingreso",
    formatear: (v) => formatearFecha(v as Date, "dd/MM/yyyy"),
  },
];

// ─── Estados de matrícula de demo ─────────────────────────────────────────────

const estadosDemo: EstadoMatricula[] = [
  {
    tipo: "ACTIVA",
    fechaInicio: new Date("2024-09-15"),
    asignaturas: [
      { id: "A1", nombre: "Cálculo I",      creditos: 6, departamento: "Matemáticas", profesorResponsable: "Dr. García" },
      { id: "A2", nombre: "Programación I", creditos: 6, departamento: "Informática",  profesorResponsable: "Dra. Martínez" },
    ],
  },
  {
    tipo: "SUSPENDIDA",
    motivo: "Impago de tasas académicas",
    fechaSuspension: new Date("2025-01-10"),
    reactivableEn: new Date("2025-04-01"),
  },
  {
    tipo: "FINALIZADA",
    notaMedia: 8.75,
    fechaFinalizacion: new Date("2027-06-30"),
    titulacionObtenida: "Grado en Ingeniería Informática",
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function App() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>(estudiantesIniciales);

  function handleEditar(actualizado: Estudiante): void {
    setEstudiantes((prev) =>
      prev.map((e) => (e.id === actualizado.id ? actualizado : e))
    );
  }

  function handleEliminar(id: Estudiante["id"]): void {
    setEstudiantes((prev) => prev.filter((e) => e.id !== id));
  }

  const hoy = new Date();
  const fechaReferencia = new Date("2023-09-01");
  const diasDesdeInicio = diferenciaDiasCalendario(fechaReferencia, hoy);

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        Fase 4 — TypeScript + React
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Demostración de <code>DataTable&lt;T&gt;</code>, genéricos,
        uniones discriminadas y <code>date-fns</code>.
      </p>

      {/* ── DataTable<Estudiante> ─────────────────────────────────────── */}
      <DataTable<Estudiante>
        titulo="Tabla de Estudiantes — DataTable<Estudiante>"
        data={estudiantes}
        columns={columnasEstudiante}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />

      {/* ── Uniones discriminadas ─────────────────────────────────────── */}
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.75rem" }}>
          Unión Discriminada: EstadoMatricula
        </h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {estadosDemo.map((estado, i) => (
            <li
              key={i}
              style={{
                padding: "0.75rem 1rem",
                marginBottom: "0.5rem",
                borderLeft: "4px solid",
                borderColor:
                  estado.tipo === "ACTIVA"
                    ? "#16a34a"
                    : estado.tipo === "SUSPENDIDA"
                    ? "#d97706"
                    : "#2563eb",
                backgroundColor: "#f9fafb",
              }}
            >
              <strong>[{estado.tipo}]</strong> {generarReporte(estado)}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Utilidades de fechas ──────────────────────────────────────── */}
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.75rem" }}>
          Utilidades de Fechas — date-fns
        </h2>
        <ul style={{ padding: "0 0 0 1.25rem" }}>
          <li>
            Hoy: <strong>{formatearFecha(hoy)}</strong>
          </li>
          <li>
            Desde el inicio del curso (01/09/2023):{" "}
            <strong>{diasDesdeInicio} días</strong> ({descripcionDiferencia(fechaReferencia, hoy)})
          </li>
          <li>
            Diferencia tipada — TypeScript verifica que ambos argumentos son{" "}
            <code>Date</code>, no <code>string</code>.
          </li>
        </ul>
      </section>
    </div>
  );
}
