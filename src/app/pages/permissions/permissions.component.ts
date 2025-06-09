import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permission } from 'src/app/models/permission.model';
import { PermissionService } from 'src/app/services/permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {
  title = 'Gestión de Permisos';
  headers = ['ID', 'URL', 'Método', 'Acciones'];
  permissions: Permission[] = [];
  displayData: any[] = [];
  isLoading = false;

  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.isLoading = true;
    this.permissionService.list().subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        this.displayData = permissions.map(permission => ({
          id: permission.id,
          url: permission.url,
          method: permission.method,
          acciones: '',
          _originalPermission: permission
        }));
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        Swal.fire('Error', 'Error al cargar la lista de permisos', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onRowClick(event: any): void {
    const permission: Permission = event.row._originalPermission;
    Swal.fire({
      title: `Permiso ${permission.id}`,
      html: `
        <div class="text-left">
          <p><strong>URL:</strong> ${permission.url}</p>
          <p><strong>Método:</strong> ${permission.method}</p>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '<i class="fas fa-edit"></i> Editar',
      denyButtonText: '<i class="fas fa-trash"></i> Eliminar',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#28a745',
      denyButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.editPermission(permission);
      } else if (result.isDenied) {
        this.deletePermission(permission);
      }
    });
  }

  onAddPermission(): void {
    Swal.fire({
      title: 'Crear Nuevo Permiso',
      html: `
        <div class="form-group text-left">
          <label for="url" class="form-label">URL del Endpoint:</label>
          <input id="url" class="swal2-input" placeholder="Ejemplo: /api/example" required>
        </div>
        <div class="form-group text-left">
          <label for="method" class="form-label">Método HTTP:</label>
          <select id="method" class="swal2-select" required>
            <option value="">Seleccionar método</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Permiso',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      width: '500px',
      preConfirm: () => {
        const url = (document.getElementById('url') as HTMLInputElement).value.trim();
        const method = (document.getElementById('method') as HTMLSelectElement).value;
        if (!url || !method) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        if (!url.startsWith('/')) {
          Swal.showValidationMessage('La URL debe comenzar con "/"');
          return false;
        }
        return { url, method };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { url, method } = result.value;
        const newPermission: Permission = {
          id: 0,  // El backend asigna el ID
          url: url,
          method: method.toUpperCase()
        };
        this.permissionService.create(newPermission).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Éxito!',
              text: 'Permiso creado correctamente',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.loadPermissions();
          },
          error: (error) => {
            console.error('Error al crear permiso:', error);
            Swal.fire({
              title: 'Error',
              text: 'Error al crear el permiso. Verifique la conexión con el servidor.',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          }
        });
      }
    });
  }

  editPermission(permission: Permission): void {
    Swal.fire({
      title: 'Editar Permiso',
      html: `
        <div class="form-group text-left">
          <label for="editUrl" class="form-label">URL del Endpoint:</label>
          <input id="editUrl" class="swal2-input" value="${permission.url}" required>
        </div>
        <div class="form-group text-left">
          <label for="editMethod" class="form-label">Método HTTP:</label>
          <select id="editMethod" class="swal2-select" required>
            <option value="GET" ${permission.method==='GET' ? 'selected' : ''}>GET</option>
            <option value="POST" ${permission.method==='POST' ? 'selected' : ''}>POST</option>
            <option value="PUT" ${permission.method==='PUT' ? 'selected' : ''}>PUT</option>
            <option value="DELETE" ${permission.method==='DELETE' ? 'selected' : ''}>DELETE</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      width: '500px',
      preConfirm: () => {
        const url = (document.getElementById('editUrl') as HTMLInputElement).value.trim();
        const method = (document.getElementById('editMethod') as HTMLSelectElement).value;
        if (!url || !method) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        if (!url.startsWith('/')) {
          Swal.showValidationMessage('La URL debe comenzar con "/"');
          return false;
        }
        return { url, method };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { url, method } = result.value;
        const updatedPermission: Permission = {
          ...permission,
          url: url,
          method: method.toUpperCase()
        };
        this.permissionService.update(updatedPermission).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Éxito!',
              text: 'Permiso actualizado correctamente',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.loadPermissions();
          },
          error: (error) => {
            console.error('Error al actualizar permiso:', error);
            Swal.fire({
              title: 'Error',
              text: 'Error al actualizar el permiso',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          }
        });
      }
    });
  }

  deletePermission(permission: Permission): void {
    Swal.fire({
      title: '¿Eliminar permiso?',
      html: `
        <p>¿Estás seguro de eliminar este permiso?</p>
        <div class="alert alert-warning mt-3">
          <strong>URL:</strong> ${permission.url}<br>
          <strong>Método:</strong> ${permission.method}
        </div>
        <p><small class="text-muted">Esta acción no se puede deshacer.</small></p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      width: '500px'
    }).then((result) => {
      if (result.isConfirmed && permission.id) {
        this.permissionService.delete(permission.id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'Permiso eliminado correctamente',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.loadPermissions();
          },
          error: (error) => {
            console.error('Error al eliminar permiso:', error);
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar el permiso. Verifique la conexión con el servidor.',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          }
        });
      }
    });
  }
}