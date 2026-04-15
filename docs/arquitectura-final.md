# Arquitectura final — Fase 4: TypeScript + React

## Objetivo

Este documento analiza cómo el uso de TypeScript estricto en los tres módulos ha reducido
la carga de errores en tiempo de ejecución (runtime) en comparación con JavaScript puro.

---

## 1. Genéricos: eliminar `any` sin perder reutilización

### El problema en JavaScript

```javascript
// JavaScript: no hay forma de saber qué tipo devuelve esto
async function obtenerRecurso(endpoint) {
  // datos puede ser cualquier cosa — no hay contrato
  const { datos } = await cliente.get(endpoint);
  return datos;
}
```

Si `datos` resulta ser un array cuando esperabas un objeto, el error explota en
runtime, posiblemente en producción.

### La solución TypeScript

```typescript
async obtenerRecurso<T>(endpoint: string): Promise<RespuestaAPI<T>> { ... }

// En el punto de uso:
const { datos } = await cliente.obtenerRecurso<Estudiante[]>("/estudiantes");
// datos: Estudiante[] — TypeScript verifica cada propiedad en compilación
```

El genérico `T` parametriza `RespuestaAPI<T>` sin duplicar interfaces.
Un error de tipado en `datos.notaMedia` aparece en el editor, no en producción.

---

## 2. Uniones discriminadas: estados imposibles son irrepresentables

### El problema en JavaScript

```javascript
// Estado ambiguo: ¿qué propiedades están disponibles?
const matricula = {
  estado: "ACTIVA",        // o "SUSPENDIDA" o "FINALIZADA"
  asignaturas: [...],      // ¿existe si es SUSPENDIDA?
  motivo: null,            // ¿es null o undefined?
  notaMedia: undefined,    // ¿cuándo es válido?
};
```

Acceder a `matricula.notaMedia` cuando el estado es `"ACTIVA"` devuelve
`undefined` en runtime — error silencioso y difícil de rastrear.

### La solución TypeScript (unión discriminada)

```typescript
type EstadoMatricula = MatriculaActiva | MatriculaSuspendida | MatriculaFinalizada;
```

En cualquier `switch(estado.tipo)`, TypeScript estrecha el tipo en cada rama.
Acceder a `estado.notaMedia` fuera del caso `"FINALIZADA"` es un **error de compilación**.
Los estados imposibles son literalmente inexpresables en el sistema de tipos.

---

## 3. Exhaustiveness check con `never`: escalabilidad garantizada

```typescript
default: {
  const comprobacionExhaustiva: never = estado;
  throw new Error(`Estado no manejado: ${JSON.stringify(comprobacionExhaustiva)}`);
}
```

Si en el futuro se añade `MatriculaCancelada` a `EstadoMatricula` sin añadir
el `case "CANCELADA"` en `generarReporte`, TypeScript emite:

```
Type 'MatriculaCancelada' is not assignable to type 'never'.
```

Este error ocurre **en compilación**, no cuando un usuario encuentra el bug
en producción.

---

## 4. Tipos de utilidad: reducir duplicación sin perder seguridad

| Tipo de utilidad | Uso | Beneficio |
|---|---|---|
| `Partial<T>` | Estado de edición en `DataTable<T>` | No duplicar la interfaz con todos los campos opcionales |
| `Pick<Estudiante, ...>` | `EstudianteResumen` | Vista pública sin datos sensibles, verificada en compilación |
| `Omit<Estudiante, "id">` | Payload de actualización | El ID no puede actualizarse por accidente |
| `Record<string, T>` | Diccionario de entidades | Búsqueda O(1) tipada |

---

## 5. `DataTable<T>`: componente genérico sin sacrificar tipos

```typescript
export function DataTable<T extends { id: string | number }>({
  datos,
  columnas,
}: DataTableProps<T>) { ... }
```

La restricción `extends { id: string | number }` garantiza que solo se puede
usar `DataTable` con entidades que tengan un identificador, previniendo errores
de renderizado (`key` en React).

El estado de edición usa `Partial<T>`:

```typescript
const [edicion, setEdicion] = useState<EstadoEdicion<T> | null>(null);
```

Esto expresa con precisión que "hay una fila en edición con algunos campos
modificados". En JavaScript esto sería un objeto con propiedades posiblemente
`undefined`, indistinguible de un estado sin edición activa.

---

## 6. date-fns: librería externa con tipos incluidos

`date-fns` incluye sus propias declaraciones TypeScript (`.d.ts`) en el paquete.
No requiere `@types/date-fns`. Esto significa:

```typescript
function diferenciaDias(fechaInicio: Date, fechaFin: Date): number
```

Si se pasa un `string` en lugar de un `Date`, TypeScript lo rechaza en compilación.
En JavaScript, `differenceInDays("2024-01-01", "2025-01-01")` también funciona
en algunos casos pero produce comportamiento indefinido en otros.

---

## Conclusión

| Técnica | Errores que previene |
|---|---|
| Genéricos | Asumir el tipo de datos de red — errores de `.propiedadInexistente` |
| Uniones discriminadas | Acceder a propiedades exclusivas de un estado en otro estado |
| `never` exhaustiveness | Olvidar actualizar código cuando se añaden nuevos casos |
| Tipos de utilidad | Duplicar interfaces incorrectamente, permitir mutaciones no deseadas |
| Tipos de librerías externas | Pasar argumentos del tipo incorrecto a funciones externas |

Con `strict: true`, TypeScript actúa como una primera línea de tests automatizados
que se ejecuta en cada guardado. El coste es declarar explícitamente las estructuras;
el beneficio es que los errores de tipo nunca llegan al navegador del usuario.
