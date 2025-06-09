import { Component, OnInit } from '@angular/core';
import { RoleService, Role } from '../../services/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  // Table configuration
  tableTitle = 'Gestión de Roles';
  tableHeaders = ['Nombre', 'Descripción', 'Fecha Creación'];
  rolesData: any[] = [];
  isLoading = false;

  // Button configuration
  tableButtons = [
    { label: 'Editar', class: 'btn-warning btn-sm', icon: 'fa-edit' },
    { label: 'Eliminar', class: 'btn-danger btn-sm', icon: 'fa-trash' }
  ];

  constructor(private roleService: RoleService) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  /**
   * Load all roles from the service
   */
  loadRoles(): void {
    this.isLoading = true;
    this.roleService.list().subscribe({
      next: (roles: Role[]) => {
        this.rolesData = roles.map(role => ({
          _id: role._id,
          name: role.name,
          description: role.description,
          created_at: role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A',
          rawData: role // Keep original data for operations
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los roles. Usando datos de ejemplo.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#5e72e4'
        });
        // Load example data
        this.loadExampleData();
      }
    });
  }

  /**
   * Load example data for testing
   */
  loadExampleData(): void {
    this.rolesData = [
      {
        _id: '1',
        name: 'Administrador',
        description: 'Acceso completo al sistema',
        created_at: '2024-01-15',
        rawData: { _id: '1', name: 'Administrador', description: 'Acceso completo al sistema' }
      },
      {
        _id: '2',
        name: 'Usuario',
        description: 'Acceso básico al sistema',
        created_at: '2024-01-20',
        rawData: { _id: '2', name: 'Usuario', description: 'Acceso básico al sistema' }
      },
      {
        _id: '3',
        name: 'Moderador',
        description: 'Acceso intermedio con permisos de moderación',
        created_at: '2024-01-25',
        rawData: { _id: '3', name: 'Moderador', description: 'Acceso intermedio con permisos de moderación' }
      }
    ];
    this.isLoading = false;
  }

  /**
   * Handle add role button click
   */
  onAddRole(): void {
    Swal.fire({
      title: 'Crear Nuevo Rol',
      html: `
        <div class="form-group text-left">
          <label for="roleName">Nombre del Rol:</label>
          <input type="text" id="roleName" class="form-control" placeholder="Ingresa el nombre del rol">
        </div>
        <div class="form-group text-left mt-3">
          <label for="roleDescription">Descripción:</label>
          <textarea id="roleDescription" class="form-control" rows="3" placeholder="Describe las funciones del rol"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Rol',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5e72e4',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const name = (document.getElementById('roleName') as HTMLInputElement)?.value;
        const description = (document.getElementById('roleDescription') as HTMLTextAreaElement)?.value;
        
        if (!name || !description) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }
        
        return { name, description };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.createRole(result.value);
      }
    });
  }

  /**
   * Handle row click
   */
  onRowClick(rowData: any): void {
    console.log('Row clicked:', rowData);
    // You can implement row click logic here
    // For example, navigate to role details or show a modal
  }

  /**
   * Create a new role
   */
  createRole(roleData: { name: string; description: string }): void {
    this.roleService.create(roleData).subscribe({
      next: (newRole: Role) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Rol creado correctamente',
          icon: 'success',
          confirmButtonColor: '#5e72e4'
        });
        this.loadRoles(); // Reload the table
      },
      error: (error) => {
        console.error('Error creating role:', error);
        // For demo purposes, add to local data
        const newRole = {
          _id: Date.now().toString(),
          name: roleData.name,
          description: roleData.description,
          created_at: new Date().toLocaleDateString(),
          rawData: { ...roleData, _id: Date.now().toString() }
        };
        this.rolesData.push(newRole);
        
        Swal.fire({
          title: '¡Simulación!',
          text: 'Rol agregado localmente (modo demo)',
          icon: 'info',
          confirmButtonColor: '#5e72e4'
        });
      }
    });
  }

  /**
   * Edit a role
   */
  editRole(role: any): void {
    Swal.fire({
      title: 'Editar Rol',
      html: `
        <div class="form-group text-left">
          <label for="editRoleName">Nombre del Rol:</label>
          <input type="text" id="editRoleName" class="form-control" value="${role.rawData.name}">
        </div>
        <div class="form-group text-left mt-3">
          <label for="editRoleDescription">Descripción:</label>
          <textarea id="editRoleDescription" class="form-control" rows="3">${role.rawData.description}</textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5e72e4',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const name = (document.getElementById('editRoleName') as HTMLInputElement)?.value;
        const description = (document.getElementById('editRoleDescription') as HTMLTextAreaElement)?.value;
        
        if (!name || !description) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }
        
        return { name, description };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.updateRole(role._id, result.value);
      }
    });
  }

  /**
   * Update a role
   */
  updateRole(roleId: string, roleData: { name: string; description: string }): void {
    this.roleService.update(roleId, roleData).subscribe({
      next: (updatedRole: Role) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Rol actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#5e72e4'
        });
        this.loadRoles(); // Reload the table
      },
      error: (error) => {
        console.error('Error updating role:', error);
        // For demo purposes, update local data
        const roleIndex = this.rolesData.findIndex(r => r._id === roleId);
        if (roleIndex !== -1) {
          this.rolesData[roleIndex] = {
            ...this.rolesData[roleIndex],
            name: roleData.name,
            description: roleData.description,
            rawData: { ...this.rolesData[roleIndex].rawData, ...roleData }
          };
        }
        
        Swal.fire({
          title: '¡Simulación!',
          text: 'Rol actualizado localmente (modo demo)',
          icon: 'info',
          confirmButtonColor: '#5e72e4'
        });
      }
    });
  }

  /**
   * Delete a role
   */
  deleteRole(role: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el rol "${role.rawData.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleService.delete(role._id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El rol ha sido eliminado correctamente',
              icon: 'success',
              confirmButtonColor: '#5e72e4'
            });
            this.loadRoles(); // Reload the table
          },
          error: (error) => {
            console.error('Error deleting role:', error);
            // For demo purposes, remove from local data
            this.rolesData = this.rolesData.filter(r => r._id !== role._id);
            
            Swal.fire({
              title: '¡Simulación!',
              text: 'Rol eliminado localmente (modo demo)',
              icon: 'info',
              confirmButtonColor: '#5e72e4'
            });
          }
        });
      }
    });
  }
}
