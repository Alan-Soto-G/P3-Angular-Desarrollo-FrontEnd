import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { SessionService } from 'src/app/services/session.service';
import { Session } from 'src/app/models/session.model';
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
  displayData: any[] = []; // Datos mapeados para la tabla
  isLoading = false;
  selectedUser: User | null = null; // Usuario seleccionado

  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Cargar lista de usuarios y mapear la data para la tabla
  loadUsers() {
    this.isLoading = true;
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users;
        // Mapea los datos para la tabla. En la columna "Sesiones" se deja vacío porque el botón se mostrará desde el HTML.
        this.displayData = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          direccion: '🏠',
          firma_digital: '✍️',
          dispositivos: '📱',
          contraseñas: '🔐',
          sesiones: '', // Se creará el botón en el HTML
          acciones: '',
          _originalUser: user
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

  // Manejador del click en una fila: asigna el usuario seleccionado y muestra su información
  onRowClick(event: any) {
    const displayedRow = event.row;
    const originalUser = displayedRow._originalUser; 
    console.log('Usuario seleccionado:', originalUser);
    this.selectedUser = originalUser;
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

  // Función para crear un nuevo usuario
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
          password: '' // Se maneja el password por separado
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
        const updatedUser: User = { ...user, name, email };
        this.userService.update(user.id!, { name, email }, updatedUser).subscribe({
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
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire('Error', 'Error al eliminar el usuario', 'error');
          }
        });
      }
    });
  }

  // Manejador para crear sesión desde la columna "Sesiones" (botón ⏰) en la tabla de Usuarios.
  // Este método se invoca al pulsar el botón que se muestra en la celda de "Sesiones".
  onCreateSession(event: any) {
    const user = event._originalUser;
    Swal.fire({
      title: `Crear sesión para ${user.name}`,
      html: `
        <input id="token" class="swal2-input" placeholder="Token" required>
        <input id="expiration" class="swal2-input" type="datetime-local" required>
        <input id="FACode" class="swal2-input" placeholder="Código 2FA" required>
        <select id="state" class="swal2-input" required>
          <option value="">Selecciona un estado</option>
          <option value="active">Activa</option>
          <option value="expired">Expirada</option>
          <option value="revoked">Revocada</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Sesión',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const token = (document.getElementById('token') as HTMLInputElement).value;
        const expirationInput = (document.getElementById('expiration') as HTMLInputElement).value;
        const FACode = (document.getElementById('FACode') as HTMLInputElement).value;
        const state = (document.getElementById('state') as HTMLSelectElement).value;
        let expiration = '';
        if (expirationInput) {
          expiration = expirationInput.replace('T', ' ') + ':00';
        }
        if (!token || !expiration || !FACode || !state) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        return { token, expiration, FACode, state };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { token, expiration, FACode, state } = result.value;
        const newSession: Session = { token, expiration, FACode, state };
        this.sessionService.create(newSession, user.id).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Sesión creada correctamente', 'success').then(() => {
              // Redirige a la vista de "/sessions" para ver la sesión creada
              this.router.navigate(['/sessions']);
            });
          },
          error: (error) => {
            const errorMessage =
              error?.error?.message ||
              error?.error ||
              error?.statusText ||
              'Error al crear la sesión';
            Swal.fire('Error', errorMessage, 'error');
          }
        });
      }
    });
  }
}