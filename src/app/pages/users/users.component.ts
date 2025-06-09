import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  
  // Datos para la tabla
  title = 'Gestión de Usuarios';
  headers = ['ID', 'Nombre', 'Email', 'Direccion', 'Firma Digital', 'Dispositivos', 'Contraseñas', 'Sesiones'];
  users: User[] = [];
  displayData: any[] = []; // Datos filtrados para mostrar
  isLoading = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Cargar lista de usuarios
  loadUsers() {
    this.isLoading = true;
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users;
        // Filtrar datos para mostrar solo ID, Nombre y Email + botones
        this.displayData = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          direccion: '🏠', // Emoji de dirección
          firma_digital: '✍️', // Emoji de firma
          dispositivos: '📱', // Emoji de dispositivos
          contraseñas: '🔐', // Emoji de contraseñas
          sesiones: '⏰', // Emoji de sesiones
          _originalUser: user // Guardar usuario completo para operaciones
        }));
        console.log('Usuarios cargados:', users);
        console.log('Datos para tabla:', this.displayData);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        Swal.fire('Error', 'Error al cargar la lista de usuarios', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Manejar evento de añadir usuario
  onAddUser() {
    Swal.fire({
      title: 'Crear Usuario',
      html: `
        <input id="name" class="swal2-input" placeholder="Nombre completo" required>
        <input id="email" class="swal2-input" placeholder="Email" type="email" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Usuario',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        
        if (!name || !email) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        
        if (!email.includes('@')) {
          Swal.showValidationMessage('Ingrese un email válido');
          return false;
        }
        
        return { name, email };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { name, email } = result.value;
        
        const newUser: User = {
          name: name,
          email: email,
          password: '' // El password se manejará por separado
        };
        
        this.userService.create(newUser).subscribe({
          next: (createdUser) => {
            Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
            this.loadUsers(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error al crear usuario:', error);
            Swal.fire('Error', 'Error al crear el usuario', 'error');
          }
        });
      }
    });
  }

  // Manejar click en fila (ver/editar usuario)
  onRowClick(event: any) {
    const displayedRow = event.row;
    const originalUser = displayedRow._originalUser; // Usuario completo del backend
    
    console.log('Usuario seleccionado:', originalUser);
    
    Swal.fire({
      title: `Usuario: ${originalUser.name}`,
      html: `
        <div class="text-left">
          <p><strong>ID:</strong> ${originalUser.id}</p>
          <p><strong>Nombre:</strong> ${originalUser.name}</p>
          <p><strong>Email:</strong> ${originalUser.email}</p>
          <p><strong>Fecha creación:</strong> ${originalUser.created_at || 'N/A'}</p>
          <p><strong>Fecha actualización:</strong> ${originalUser.updated_at || 'N/A'}</p>
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
        this.editUser(originalUser);
      } else if (result.isDenied) {
        this.deleteUser(originalUser);
      }
    });
  }

  // Editar usuario
  editUser(user: User) {
    Swal.fire({
      title: 'Editar Usuario',
      html: `
        <input id="editName" class="swal2-input" placeholder="Nombre completo" value="${user.name}" required>
        <input id="editEmail" class="swal2-input" placeholder="Email" type="email" value="${user.email}" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = (document.getElementById('editName') as HTMLInputElement).value;
        const email = (document.getElementById('editEmail') as HTMLInputElement).value;
        
        if (!name || !email) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        
        if (!email.includes('@')) {
          Swal.showValidationMessage('Ingrese un email válido');
          return false;
        }
        
        return { name, email };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { name, email } = result.value;
        
        const updatedUser: User = {
          ...user,
          name: name,
          email: email
        };
        
        this.userService.update(updatedUser).subscribe({
          next: (response) => {
            Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
            this.loadUsers(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error al actualizar usuario:', error);
            Swal.fire('Error', 'Error al actualizar el usuario', 'error');
          }
        });
      }
    });
  }

  // Eliminar usuario
  deleteUser(user: User) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de eliminar a ${user.name}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed && user.id) {
        this.userService.delete(user.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
            this.loadUsers(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire('Error', 'Error al eliminar el usuario', 'error');
          }
        });
      }
    });
  }

}
