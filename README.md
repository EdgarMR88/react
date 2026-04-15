# React — Fase 4, Módulo 3

Proyecto React + TypeScript + Vite con componentes genéricos y tipado estricto.

## Estructura

```
react/
  src/
    components/
      DataTable.tsx    Componente genérico DataTable<T> con estado de edición Partial<T>
    utils/
      fechas.ts        Utilidades de fechas con date-fns (tipos incluidos)
    types/
      matricula.ts     EstadoMatricula (unión discriminada) con exhaustiveness check
    App.tsx            Demo integrada
    main.tsx           Punto de entrada React
  docs/
    arquitectura-final.md  Análisis de beneficios de TypeScript vs JavaScript
```

## Cómo ejecutar

```bash
npm install
npm run dev          # Servidor de desarrollo Vite
npx tsc --noEmit     # Verificar tipos sin compilar (debe dar 0 errores)
```

## Conceptos cubiertos

- Componente genérico `DataTable<T>` con restricción `extends { id: string | number }`
- Props tipadas con `interface DataTableProps<T>`
- Estado de edición con `Partial<T> | null` (tipo de utilidad)
- Hooks tipados: `useState<EstadoEdicion<T> | null>(null)`
- Unión discriminada `EstadoMatricula` con exhaustiveness check usando `never`
- Librería externa `date-fns` con tipos integrados (sin `@types/`)
- `npx tsc --noEmit` con 0 errores
