import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Profile } from 'src/app/models/profile.model';
import { User } from 'src/app/models/user.model';
import { ProfileService } from 'src/app/services/profile.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent implements OnInit {
  title = 'Gestión de Perfiles';
  headers = ['ID', 'Usuario', 'Teléfono', 'Foto', 'Acciones'];
  profiles: Profile[] = [];
  users: User[] = [];
  displayData: any[] = [];
  isLoading = false;

  constructor(
    private profileService: ProfileService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsersAndProfiles();
  }

  // Cargar usuarios primero, luego perfiles
  loadUsersAndProfiles(): void {
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users || [];
        console.log('Usuarios cargados:', this.users);
        // Después de cargar usuarios, cargar perfiles
        this.loadProfiles();
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        // Aún así intentar cargar perfiles
        this.loadProfiles();
      }
    });
  }

 loadProfiles(): void {
  this.isLoading = true;
  this.profileService.list().subscribe({
    next: (profiles) => {
      console.log('Datos recibidos del backend:', profiles);
      this.profiles = profiles;
      this.displayData = profiles.map(profile => {
        console.log('Profile individual:', profile);
        
        // Usar user_id (del backend) o userId (del frontend) - lo que esté disponible
        const userIdToFind = profile.user_id || profile.userId;
        const user = this.users.find(u => u.id === userIdToFind);
        console.log('Usuario encontrado:', user);
        console.log('Teléfono del perfil:', profile.phone); // 👈 AGREGAR ESTA LÍNEA PARA DEBUG
        
return {
  id: profile.id,
  usuario: user ? user.name : `Usuario ID: ${userIdToFind}`, // 👈 SOLO EL NOMBRE
  email: user ? user.email : '---', // 👈 AGREGAR COLUMNA EMAIL
  telefono: profile.phone || '---',
  foto: profile.photo ? '📷' : '❌',
  acciones: '',
  _originalProfile: {
    ...profile,
    userName: user?.name,
    userEmail: user?.email,
    userId: userIdToFind,
    user_id: userIdToFind
  }
};
      });
      console.log('DisplayData mapeado:', this.displayData);
    },
    error: (error) => {
      console.error('Error al cargar perfiles:', error);
      Swal.fire('Error', 'Error al cargar la lista de perfiles', 'error');
    },
    complete: () => {
      this.isLoading = false;
    }
  });
}

  onAddProfile(): void {
    Swal.fire({
      title: 'Crear Perfil',
      html: `
        <div class="form-group text-left">
          <label for="user" class="form-label">Usuario:</label>
          <select id="user" class="swal2-select" required>
            <option value="">Seleccionar Usuario</option>
            ${this.users.map(user => `<option value="${user.id}">${user.name} (${user.email})</option>`).join('')}
          </select>
        </div>
        <div class="form-group text-left">
          <label for="phone" class="form-label">Teléfono:</label>
          <input id="phone" class="swal2-input" placeholder="Teléfono" type="tel">
        </div>
        <div class="form-group text-left">
          <label for="photo" class="form-label">Foto:</label>
          <input id="photo" type="file" accept="image/*" class="swal2-file">
          <img id="photo-preview" style="max-width: 200px; max-height: 200px; margin-top: 10px; display: none;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Perfil',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      width: '500px',
      preConfirm: () => {
        const userId = (document.getElementById('user') as HTMLSelectElement).value;
        const phone = (document.getElementById('phone') as HTMLInputElement).value.trim();
        const photoInput = document.getElementById('photo') as HTMLInputElement;
        
        if (!userId) {
          Swal.showValidationMessage('Debe seleccionar un usuario');
          return false;
        }
        
        return { userId, phone, photoFile: photoInput.files?.[0] };
      },
      didOpen: () => {
        const photoInput = document.getElementById('photo') as HTMLInputElement;
        const preview = document.getElementById('photo-preview') as HTMLImageElement;
        
        photoInput.addEventListener('change', function() {
          if (photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
              preview.src = e.target?.result as string;
              preview.style.display = 'block';
            };
            reader.readAsDataURL(photoInput.files[0]);
          }
        });
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { userId, phone, photoFile } = result.value;
        
        const processProfile = (photoBase64?: string) => {
          const newProfile: Profile = {
            userId: Number(userId),
            phone: phone,
            photo: photoBase64 || ''
          };
          
          this.profileService.create(newProfile).subscribe({
            next: () => {
              Swal.fire({
                title: '¡Éxito!',
                text: 'Perfil creado correctamente',
                icon: 'success',
                confirmButtonColor: '#28a745'
              });
              this.loadProfiles();
            },
            error: (error) => {
              console.error('Error al crear perfil:', error);
              Swal.fire({
                title: 'Error',
                text: 'Error al crear el perfil',
                icon: 'error',
                confirmButtonColor: '#dc3545'
              });
            }
          });
        };

        if (photoFile) {
          const reader = new FileReader();
          reader.onload = () => processProfile(reader.result as string);
          reader.readAsDataURL(photoFile);
        } else {
          processProfile();
        }
      }
    });
  }

  onRowClick(event: any): void {
    const profile: Profile = event.row._originalProfile;
    
    Swal.fire({
      title: `Perfil ID: ${profile.id}`,
      html: `
        <div class="text-left">
          <p><strong>Usuario:</strong> ${profile.userName || '---'}</p>
          <p><strong>Email:</strong> ${profile.userEmail || '---'}</p>
          <p><strong>Teléfono:</strong> ${profile.phone || '---'}</p>
          ${profile.photo ? `<div style="text-align: center; margin: 10px 0;"><img src="http://localhost:5000/${profile.photo}" alt="Foto de perfil" style="max-width: 200px; max-height: 200px; border-radius: 8px;"></div>` : '<p><strong>Foto:</strong> Sin foto</p>'}
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
        this.editProfile(profile);
      } else if (result.isDenied) {
        this.deleteProfile(profile);
      }
    });
  }

  editProfile(profile: Profile): void {
    Swal.fire({
      title: 'Editar Perfil',
      html: `
        <div class="form-group text-left">
          <label for="editUser" class="form-label">Usuario:</label>
          <select id="editUser" class="swal2-select" required>
            <option value="">Seleccionar Usuario</option>
            ${this.users.map(user => `<option value="${user.id}" ${user.id === profile.userId ? 'selected' : ''}>${user.name} (${user.email})</option>`).join('')}
          </select>
        </div>
        <div class="form-group text-left">
          <label for="editPhone" class="form-label">Teléfono:</label>
          <input id="editPhone" class="swal2-input" placeholder="Teléfono" type="tel" value="${profile.phone || ''}">
        </div>
        <div class="form-group text-left">
          <label for="editPhoto" class="form-label">Foto:</label>
          <input id="editPhoto" type="file" accept="image/*" class="swal2-file">
          <img id="edit-photo-preview" src="${profile.photo ? `http://localhost:5000/${profile.photo}` : ''}" style="max-width: 200px; max-height: 200px; margin-top: 10px; ${profile.photo ? 'display: block;' : 'display: none;'}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      width: '500px',
      preConfirm: () => {
        const userId = (document.getElementById('editUser') as HTMLSelectElement).value;
        const phone = (document.getElementById('editPhone') as HTMLInputElement).value.trim();
        const photoInput = document.getElementById('editPhoto') as HTMLInputElement;
        
        if (!userId) {
          Swal.showValidationMessage('Debe seleccionar un usuario');
          return false;
        }
        
        return { userId, phone, photoFile: photoInput.files?.[0] };
      },
      didOpen: () => {
        const photoInput = document.getElementById('editPhoto') as HTMLInputElement;
        const preview = document.getElementById('edit-photo-preview') as HTMLImageElement;
        
        photoInput.addEventListener('change', function() {
          if (photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
              preview.src = e.target?.result as string;
              preview.style.display = 'block';
            };
            reader.readAsDataURL(photoInput.files[0]);
          }
        });
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { userId, phone, photoFile } = result.value;
        
        const processUpdate = (photoBase64?: string) => {
          const updatedProfile: Profile = {
            ...profile,
            userId: Number(userId),
            phone: phone,
            photo: photoBase64 || profile.photo
          };
          
          this.profileService.update(profile.id!, updatedProfile).subscribe({
            next: () => {
              Swal.fire({
                title: '¡Éxito!',
                text: 'Perfil actualizado correctamente',
                icon: 'success',
                confirmButtonColor: '#28a745'
              });
              this.loadProfiles();
            },
            error: (error) => {
              console.error('Error al actualizar perfil:', error);
              Swal.fire({
                title: 'Error',
                text: 'Error al actualizar el perfil',
                icon: 'error',
                confirmButtonColor: '#dc3545'
              });
            }
          });
        };

        if (photoFile) {
          const reader = new FileReader();
          reader.onload = () => processUpdate(reader.result as string);
          reader.readAsDataURL(photoFile);
        } else {
          processUpdate();
        }
      }
    });
  }

  deleteProfile(profile: Profile): void {
    Swal.fire({
      title: '¿Eliminar perfil?',
      html: `
        <p>¿Estás seguro de eliminar este perfil?</p>
        <div class="alert alert-warning mt-3">
          <strong>Usuario:</strong> ${profile.userName || '---'}<br>
          <strong>Teléfono:</strong> ${profile.phone || '---'}
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
      if (result.isConfirmed && profile.id) {
        this.profileService.delete(profile.id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'Perfil eliminado correctamente',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.loadProfiles();
          },
          error: (error) => {
            console.error('Error al eliminar perfil:', error);
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar el perfil',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          }
        });
      }
    });
  }
}