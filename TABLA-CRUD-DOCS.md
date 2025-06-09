# Documentación: Componente TableCrud

## ¿Cómo usar el componente TableCrud?

El componente `<app-table-crud>` es un componente reutilizable que permite crear tablas CRUD de forma rápida y consistente.

### Props (Inputs) que acepta:

- `title`: string - Título que aparece arriba de la tabla
- `headers`: string[] - Array con los nombres de las columnas
- `data`: any[] - Array con los datos a mostrar
- `buttons`: any[] - Array de botones (reservado para uso futuro)
- `showAddButton`: boolean - Si mostrar el botón de añadir (default: true)
- `addButtonText`: string - Texto del botón añadir (default: 'Añadir')

### Eventos (Outputs) que emite:

- `(onAdd)`: Se dispara cuando se hace clic en el botón añadir
- `(onRowClick)`: Se dispara cuando se hace clic en una fila, devuelve `{row, index}`

### Ejemplo de uso en TypeScript:

```typescript
export class UserListComponent implements OnInit {
  // Configuración de la tabla
  title = 'Lista de Usuarios';
  headers = ['ID', 'Nombre', 'Email', 'Fecha'];
  users = [
    { id: 1, name: 'Juan Pérez', email: 'juan@email.com', date: '2025-01-01' },
    { id: 2, name: 'María López', email: 'maria@email.com', date: '2025-01-02' }
  ];

  // Métodos para manejar eventos
  onAddUser() {
    console.log('Crear nuevo usuario');
  }

  onRowClick(event: any) {
    console.log('Fila clickeada:', event.row);
    console.log('Índice:', event.index);
  }
}
```

### Ejemplo de uso en HTML:

```html
<app-table-crud
  [title]="title"
  [headers]="headers"
  [data]="users"
  addButtonText="Crear Usuario"
  (onAdd)="onAddUser()"
  (onRowClick)="onRowClick($event)">
</app-table-crud>
```

### Casos de uso:

1. **Usuarios**: Gestión de usuarios del sistema
2. **Teatros**: Listado de teatros y salas
3. **Roles**: Administración de roles y permisos
4. **Dispositivos**: Gestión de dispositivos registrados
5. **Cualquier entidad**: El componente es genérico y funciona con cualquier array de objetos

### Características:

- ✅ Responsive (se adapta a pantallas pequeñas)
- ✅ Estado vacío (muestra mensaje cuando no hay datos)
- ✅ Filas clickeables con efecto hover
- ✅ Botón de añadir configurable
- ✅ Diseño consistente con el tema Argon
- ✅ Totalmente reutilizable

### Próximas mejoras (array `buttons`):

El array `buttons` está preparado para futuras funcionalidades como:
- Botones de acción por fila (editar, eliminar, ver)
- Filtros y búsqueda
- Paginación
- Ordenamiento por columnas
