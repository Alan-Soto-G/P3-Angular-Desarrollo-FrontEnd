import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from 'src/app/models/role.model';
import { Permission } from 'src/app/models/permission.model';
import { RoleService } from 'src/app/services/role.service';
import { PermissionService } from 'src/app/services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
    title = 'Gestión de Roles';
    headers = ['ID', 'Nombre', 'Descripción', 'Permisos', 'Acciones'];
    roles: Role[] = [];
    permissions: Permission[] = [];
    displayData: any[] = [];
    isLoading = false;

    // Modelos disponibles para permisos
    availableModels = ['Users', 'Roles', 'Permissions'];
    // Operaciones disponibles
    availableOperations = ['View', 'List', 'Create', 'Update', 'Delete'];

    constructor(
        private roleService: RoleService,
        private permissionService: PermissionService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadRoles();
        this.loadPermissions();
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

loadRoles(): void {
    this.isLoading = true;
    this.roleService.list().subscribe({
        next: (roles) => {
            this.roles = roles;
            this.displayData = roles.map(role => ({
                id: role.id,
                nombre: role.name,
                descripcion: role.description || 'Sin descripción',
                permisos: 'Permisos', // 👈 Hacer más obvio
                acciones: 'Opciones',
                _originalRole: role
            }));
        },
        error: (error) => {
            console.error('Error al cargar roles:', error);
            Swal.fire('Error', 'Error al cargar la lista de roles', 'error');
        },
        complete: () => {
            this.isLoading = false;
        }
    });
}

onRowClick(event: any): void {
    const role: Role = event.row._originalRole;
    const clickedColumn = event.column;
    const columnIndex = event.columnIndex; // Si está disponible

    console.log('Evento completo:', event); // 👈 Para debug
    console.log('Columna clickeada:', clickedColumn);
    console.log('Índice de columna:', columnIndex);

    // Detectar si es la columna de Permisos (índice 3: ID=0, Nombre=1, Descripción=2, Permisos=3)
    if (columnIndex === 3 || clickedColumn === 'permisos' || clickedColumn === 'Permisos') {
        this.openPermissionsModal(role);
        return;
    }

    // Modal normal para ver/editar/eliminar rol
    this.showRoleOptionsModal(role);
}

// Separar el modal de opciones del rol
showRoleOptionsModal(role: Role): void {
    Swal.fire({
        title: `Rol: ${role.name}`,
        html: `
            <div class="text-left">
                <p><strong>ID:</strong> ${role.id}</p>
                <p><strong>Nombre:</strong> ${role.name}</p>
                <p><strong>Descripción:</strong> ${role.description || 'Sin descripción'}</p>
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
            this.editRole(role);
        } else if (result.isDenied) {
            this.deleteRole(role);
        }
    });
}

    // Modal para gestionar permisos (versión simplificada sin backend por ahora)
    openPermissionsModal(role: Role): void {
        // Crear matriz de permisos por modelo y operación
        let permissionsMatrix = `
            <div class="permissions-container">
                <h5>${role.name} - Permissions</h5>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th>View</th>
                            <th>List</th>
                            <th>Create</th>
                            <th>Update</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Crear filas para cada modelo
        this.availableModels.forEach(model => {
            permissionsMatrix += `<tr><td><strong>${model}</strong></td>`;
            
            this.availableOperations.forEach(operation => {
                const permissionKey = `${model.toLowerCase()}_${operation.toLowerCase()}`;
                
                permissionsMatrix += `
                    <td class="text-center">
                        <input type="checkbox" 
                               id="${permissionKey}" 
                               data-model="${model}" 
                               data-operation="${operation}">
                    </td>
                `;
            });
            
            permissionsMatrix += `</tr>`;
        });

        permissionsMatrix += `
                    </tbody>
                </table>
            </div>
        `;

        // Mostrar modal con la matriz de permisos
        Swal.fire({
            title: 'Gestionar Permisos',
            html: permissionsMatrix,
            width: '800px',
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-save"></i> Guardar Permisos',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            customClass: {
                popup: 'permissions-modal'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const selectedPermissions = this.collectPermissionsFromModal();
                console.log('Permisos seleccionados para', role.name, ':', selectedPermissions);
                
                Swal.fire({
                    title: '¡Guardado!',
                    text: 'Permisos actualizados correctamente (simulado)',
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                });
            }
        });
    }

    // Recopilar permisos seleccionados del modal
    collectPermissionsFromModal(): any[] {
        const selectedPermissions: any[] = [];
        
        this.availableModels.forEach(model => {
            this.availableOperations.forEach(operation => {
                const permissionKey = `${model.toLowerCase()}_${operation.toLowerCase()}`;
                const checkbox = document.getElementById(permissionKey) as HTMLInputElement;
                
                if (checkbox && checkbox.checked) {
                    selectedPermissions.push({
                        model: model,
                        operation: operation,
                        url: `/${model.toLowerCase()}`,
                        method: this.getMethodForOperation(operation)
                    });
                }
            });
        });
        
        return selectedPermissions;
    }

    // Mapear operación a método HTTP
    getMethodForOperation(operation: string): string {
        switch (operation.toLowerCase()) {
            case 'view':
            case 'list':
                return 'GET';
            case 'create':
                return 'POST';
            case 'update':
                return 'PUT';
            case 'delete':
                return 'DELETE';
            default:
                return 'GET';
        }
    }

    onAddRole(): void {
        Swal.fire({
            title: 'Crear Nuevo Rol',
            html: `
                <div class="form-group text-left">
                    <label for="name" class="form-label">Nombre del Rol:</label>
                    <input id="name" class="swal2-input" placeholder="Ejemplo: Administrador" required>
                </div>
                <div class="form-group text-left">
                    <label for="description" class="form-label">Descripción:</label>
                    <textarea id="description" class="swal2-textarea" placeholder="Descripción del rol"></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Crear Rol',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            width: '500px',
            preConfirm: () => {
                const name = (document.getElementById('name') as HTMLInputElement).value.trim();
                const description = (document.getElementById('description') as HTMLTextAreaElement).value.trim();
                
                if (!name) {
                    Swal.showValidationMessage('El nombre del rol es obligatorio');
                    return false;
                }
                if (name.length < 3) {
                    Swal.showValidationMessage('El nombre debe tener al menos 3 caracteres');
                    return false;
                }
                return { name, description };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const { name, description } = result.value;
                const newRole: Role = {
                    id: 0,
                    name: name,
                    description: description
                };
                
                this.roleService.create(newRole).subscribe({
                    next: () => {
                        Swal.fire({
                            title: '¡Éxito!',
                            text: 'Rol creado correctamente',
                            icon: 'success',
                            confirmButtonColor: '#28a745'
                        });
                        this.loadRoles();
                    },
                    error: (error) => {
                        console.error('Error al crear rol:', error);
                        Swal.fire({
                            title: 'Error',
                            text: 'Error al crear el rol. Verifique la conexión con el servidor.',
                            icon: 'error',
                            confirmButtonColor: '#dc3545'
                        });
                    }
                });
            }
        });
    }

    editRole(role: Role): void {
        Swal.fire({
            title: 'Editar Rol',
            html: `
                <div class="form-group text-left">
                    <label for="editName" class="form-label">Nombre del Rol:</label>
                    <input id="editName" class="swal2-input" value="${role.name}" required>
                </div>
                <div class="form-group text-left">
                    <label for="editDescription" class="form-label">Descripción:</label>
                    <textarea id="editDescription" class="swal2-textarea">${role.description || ''}</textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            width: '500px',
            preConfirm: () => {
                const name = (document.getElementById('editName') as HTMLInputElement).value.trim();
                const description = (document.getElementById('editDescription') as HTMLTextAreaElement).value.trim();
                
                if (!name) {
                    Swal.showValidationMessage('El nombre del rol es obligatorio');
                    return false;
                }
                if (name.length < 3) {
                    Swal.showValidationMessage('El nombre debe tener al menos 3 caracteres');
                    return false;
                }
                return { name, description };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const { name, description } = result.value;
                const updatedRole: Role = {
                    ...role,
                    name: name,
                    description: description
                };
                
                this.roleService.update(updatedRole).subscribe({
                    next: () => {
                        Swal.fire({
                            title: '¡Éxito!',
                            text: 'Rol actualizado correctamente',
                            icon: 'success',
                            confirmButtonColor: '#28a745'
                        });
                        this.loadRoles();
                    },
                    error: (error) => {
                        console.error('Error al actualizar rol:', error);
                        Swal.fire({
                            title: 'Error',
                            text: 'Error al actualizar el rol',
                            icon: 'error',
                            confirmButtonColor: '#dc3545'
                        });
                    }
                });
            }
        });
    }

    deleteRole(role: Role): void {
        Swal.fire({
            title: '¿Eliminar rol?',
            html: `
                <p>¿Estás seguro de eliminar el rol <strong>"${role.name}"</strong>?</p>
                <div class="alert alert-warning mt-3">
                    <small><i class="fas fa-exclamation-triangle"></i> Esta acción eliminará también todas las asignaciones de este rol.</small>
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
            if (result.isConfirmed && role.id) {
                this.roleService.delete(role.id).subscribe({
                    next: () => {
                        Swal.fire({
                            title: '¡Eliminado!',
                            text: 'Rol eliminado correctamente',
                            icon: 'success',
                            confirmButtonColor: '#28a745'
                        });
                        this.loadRoles();
                    },
                    error: (error) => {
                        console.error('Error al eliminar rol:', error);
                        Swal.fire({
                            title: 'Error',
                            text: 'Error al eliminar el rol. Puede que esté siendo usado por otros usuarios.',
                            icon: 'error',
                            confirmButtonColor: '#dc3545'
                        });
                    }
                });
            }
        });
    }
}