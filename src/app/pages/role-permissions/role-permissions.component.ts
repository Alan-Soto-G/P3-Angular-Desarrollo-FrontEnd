import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolePermission } from 'src/app/models/rolePermission.model';
import { Role } from 'src/app/models/role.model';
import { Permission } from 'src/app/models/permission.model';
import { RolePermissionService } from 'src/app/services/rolePermission.service';
import { RoleService } from 'src/app/services/role.service';
import { PermissionService } from 'src/app/services/permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss']
})
export class RolePermissionsComponent implements OnInit {
  title = 'Gestión de Asignaciones de Permisos';
  headers = ['ID', 'Rol', 'Permiso', 'Fecha Inicio', 'Fecha Fin', 'Acciones'];
  rolePermissions: RolePermission[] = [];
  displayData: any[] = [];
  isLoading = false;

  roles: Role[] = [];
  permissions: Permission[] = [];
  selectedRoleId: number | null = null;

  constructor(
    private rolePermissionService: RolePermissionService,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
    this.loadRolePermissions();
  }

  loadRoles(): void {
    this.roleService.list().subscribe({
      next: (roles) => {
        this.roles = [];
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  loadPermissions(): void {
    this.permissionService.list().subscribe({
      next: (permissions) => {
        this.permissions = permissions;
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
      }
    });
  }

  loadRolePermissions(): void {
    this.isLoading = true;
    this.rolePermissionService.list().subscribe({
      next: (rolePermissions) => {
        this.rolePermissions = rolePermissions;
        this.displayData = rolePermissions.map(rp => ({
          id: rp.id,
          rol: rp.roleName || '---',
          permiso: `${rp.permissionMethod} ${rp.permissionUrl}` || '---',
          fechaInicio: this.formatDate(rp.startAt),
          fechaFin: this.formatDate(rp.endAt),
          acciones: '',
          _originalRolePermission: rp
        }));
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
        Swal.fire('Error', 'Error al cargar la lista de asignaciones', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  formatDate(dateStr: any): string {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }

  onAddRolePermission(): void {
    Swal.fire({
      title: 'Asignar Permiso a Rol',
      html: `
        <div class="form-group text-left">
          <label for="role" class="form-label">Rol:</label>
          <select id="role" class="swal2-select" required>
            <option value="">Seleccionar Rol</option>
            ${this.roles.map(role => `<option value="${role.id}">${role.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group text-left">
          <label for="permission" class="form-label">Permiso:</label>
          <select id="permission" class="swal2-select" required>
            <option value="">Seleccionar Permiso</option>
            ${this.permissions.map(perm => `<option value="${perm.id}">${perm.method} ${perm.url}</option>`).join('')}
          </select>
        </div>
        <div class="form-group text-left">
          <label for="startAt" class="form-label">Fecha Inicio:</label>
          <input id="startAt" type="date" class="swal2-input" required>
        </div>
        <div class="form-group text-left">
          <label for="endAt" class="form-label">Fecha Fin:</label>
          <input id="endAt" type="date" class="swal2-input">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      width: '500px',
      preConfirm: () => {
        const roleId = (document.getElementById('role') as HTMLSelectElement).value;
        const permissionId = (document.getElementById('permission') as HTMLSelectElement).value;
        const startAt = (document.getElementById('startAt') as HTMLInputElement).value;
        const endAt = (document.getElementById('endAt') as HTMLInputElement).value;
        
        if (!roleId || !permissionId || !startAt) {
          Swal.showValidationMessage('Rol, Permiso y Fecha Inicio son obligatorios');
          return false;
        }
        
        return { roleId, permissionId, startAt, endAt };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { roleId, permissionId, startAt, endAt } = result.value;
        
        const newRolePermission: RolePermission = {
          id: '',  // El backend asignará el id
          roleId: Number(roleId),
          permissionId: Number(permissionId),
          startAt: new Date(startAt),
          endAt: endAt ? new Date(endAt) : null
        };
        
        this.rolePermissionService.create(newRolePermission).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Éxito!',
              text: 'Permiso asignado correctamente',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.loadRolePermissions();
          },
          error: (error) => {
            console.error('Error al asignar permiso:', error);
            Swal.fire({
              title: 'Error',
              text: 'Error al asignar el permiso. Verifique la conexión con el servidor.',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          }
        });
      }
    });
  }

  onRowClick(event: any): void {
    const rolePermission = event.row._originalRolePermission;
    
    Swal.fire({
      title: `Asignación ID: ${rolePermission.id}`,
      html: `
        <div class="text-left">
          <p><strong>Rol:</strong> ${rolePermission.roleName || '---'}</p>
          <p><strong>Permiso:</strong> ${rolePermission.permissionMethod} ${rolePermission.permissionUrl}</p>
          <p><strong>Fecha Inicio:</strong> ${this.formatDate(rolePermission.startAt)}</p>
          <p><strong>Fecha Fin:</strong> ${this.formatDate(rolePermission.endAt) || 'Sin fecha de fin'}</p>
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
        this.editRolePermission(rolePermission);
      } else if (result.isDenied) {
        this.deleteRolePermission(rolePermission);
      }
    });
  }

  editRolePermission(rolePermission: RolePermission): void {
    Swal.fire({
      title: 'Editar Asignación',
      html: `
        <div class="form-group text-left">
          <label for="editRole" class="form-label">Rol:</label>
          <select id="editRole" class="swal2-select" required>
            <option value="">Seleccionar Rol</option>
            ${this.roles.map(role => `<option value="${role.id}" ${role.id === rolePermission.roleId ? 'selected' : ''}>${role.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group text-left">
          <label for="editPermission" class="form-label">Permiso:</label>
          <select id="editPermission" class="swal2-select" required>
            <option value="">Seleccionar Permiso</option>
            ${this.permissions.map(perm => `<option value="${perm.id}" ${perm.id === rolePermission.permissionId ? 'selected' : ''}>${perm.method} ${perm.url}</option>`).join('')}
          </select>
        </div>
        <div class="form-group text-left">
          <label for="editStartAt" class="form-label">Fecha Inicio:</label>
          <input id="editStartAt" type="date" class="swal2-input" value="${this.formatDateForInput(rolePermission.startAt)}" required>
        </div>
        <div class="form-group text-left">
          <label for="editEndAt" class="form-label">Fecha Fin:</label>
          <input id="editEndAt" type="date" class="swal2-input" value="${rolePermission.endAt ? this.formatDateForInput(rolePermission.endAt) : ''}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      width: '500px',
      preConfirm: () => {
        const roleId = (document.getElementById('editRole') as HTMLSelectElement).value;
        const permissionId = (document.getElementById('editPermission') as HTMLSelectElement).value;
        const startAt = (document.getElementById('editStartAt') as HTMLInputElement).value;
        const endAt = (document.getElementById('editEndAt') as HTMLInputElement).value;
        
        if (!roleId || !permissionId || !startAt) {
          Swal.showValidationMessage('Rol, Permiso y Fecha Inicio son obligatorios');
          return false;
        }
        
        return { roleId, permissionId, startAt, endAt };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { roleId, permissionId, startAt, endAt } = result.value;
        
        const updatedRolePermission: RolePermission = {
          ...rolePermission,
          roleId: Number(roleId),
          permissionId: Number(permissionId),
          startAt: new Date(startAt),
          endAt: endAt ? new Date(endAt) : null
        };
        
        this.rolePermissionService.update(updatedRolePermission).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Éxito!',
              text: 'Asignación actualizada correctamente',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.loadRolePermissions();
          },
          error: (error) => {
            console.error('Error al actualizar asignación:', error);
            Swal.fire({
              title: 'Error',
              text: 'Error al actualizar la asignación',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          }
        });
      }
    });
  }

  deleteRolePermission(rolePermission: RolePermission): void {
    Swal.fire({
      title: '¿Eliminar asignación?',
      html: `
        <p>¿Estás seguro de eliminar esta asignación?</p>
        <div class="alert alert-warning mt-3">
          <strong>Rol:</strong> ${rolePermission.roleName || '---'}<br>
          <strong>Permiso:</strong> ${rolePermission.permissionMethod} ${rolePermission.permissionUrl}<br>
          <strong>Fecha Inicio:</strong> ${this.formatDate(rolePermission.startAt)}<br>
          <strong>Fecha Fin:</strong> ${this.formatDate(rolePermission.endAt) || 'Sin fecha de fin'}
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
      if (result.isConfirmed && rolePermission.id) {
        this.rolePermissionService.delete(rolePermission.id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'Asignación eliminada correctamente',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.loadRolePermissions();
          },
          error: (error) => {
            console.error('Error al eliminar asignación:', error);
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar la asignación',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          }
        });
      }
    });
  }

  formatDateForInput(dateStr: any): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    return [year, month, day].join('-');
  }
}