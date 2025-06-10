import { Component, OnInit } from '@angular/core';
import { DigitalSignature } from 'src/app/models/digital-signature.model';
import { DigitalSignatureService } from 'src/app/services/digital-signature.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-digital-signatures',
  templateUrl: './digital-signatures.component.html',
  styleUrls: ['./digital-signatures.component.scss']
})
export class DigitalSignaturesComponent implements OnInit {
  
  // Configuración para la tabla
  title = 'Gestión de Firmas Digitales';
  headers = ['ID', 'Usuario', 'Fecha Creación', 'Fecha Actualización'];
  
  // Datos
  digitalSignatures: DigitalSignature[] = [];
  displayData: any[] = [];
  users: User[] = [];
  isLoading = false;
  selectedSignature: DigitalSignature | null = null;

  // Estadísticas
  statistics = [
    { title: 'Total Firmas', value: 0, icon: 'fas fa-signature', color: 'primary' },
    { title: 'Usuarios con Firma', value: 0, icon: 'fas fa-users', color: 'success' },
    { title: 'Este Mes', value: 0, icon: 'fas fa-calendar', color: 'info' },
    { title: 'Activas', value: 0, icon: 'fas fa-check-circle', color: 'warning' }
  ];

  constructor(
    private digitalSignatureService: DigitalSignatureService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadDigitalSignatures();
  }

  // Cargar usuarios para el dropdown
  loadUsers() {
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Usuarios cargados:', users);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  // Cargar todas las firmas digitales
  loadDigitalSignatures() {
    this.isLoading = true;
    this.digitalSignatureService.getAll().subscribe({
      next: (signatures) => {
        this.digitalSignatures = signatures;
        this.mapDataForTable();
        this.updateStatistics();
        console.log('Firmas digitales cargadas:', signatures);
      },
      error: (error) => {
        console.error('Error al cargar firmas digitales:', error);
        Swal.fire('Error', 'Error al cargar las firmas digitales', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Mapear datos para la tabla
  mapDataForTable() {
    this.displayData = this.digitalSignatures.map(signature => {
      const user = this.users.find(u => u.id === signature.user_id);
      return {
        id: signature.id,
        usuario: user ? `${user.name} (ID: ${user.id})` : `Usuario ID: ${signature.user_id}`,
        created_at: this.formatDate(signature.created_at),
        updated_at: this.formatDate(signature.updated_at),
        acciones: '',
        _originalSignature: signature,
        _user: user
      };
    });
  }

  // Actualizar estadísticas
  updateStatistics() {
    const totalSignatures = this.digitalSignatures.length;
    const uniqueUsers = new Set(this.digitalSignatures.map(s => s.user_id)).size;
    const thisMonth = this.digitalSignatures.filter(s => {
      if (!s.created_at) return false;
      const createdDate = new Date(s.created_at);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length;

    this.statistics[0].value = totalSignatures;
    this.statistics[1].value = uniqueUsers;
    this.statistics[2].value = thisMonth;
    this.statistics[3].value = totalSignatures; // Asumimos que todas están activas
  }

  // Formatear fecha
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }
  // Manejar click en fila de la tabla
  onRowClick(event: any) {
    const displayedRow = event.row;
    const originalSignature = displayedRow._originalSignature;
    const user = displayedRow._user;
    
    console.log('Firma digital seleccionada:', originalSignature);
    this.selectedSignature = originalSignature;

    // Obtener URL de la imagen
    const photoUrl = this.digitalSignatureService.getPhotoUrl(originalSignature.photo || '');

    Swal.fire({
      title: `${user?.name || 'Usuario'} - Firma`,
      html: `
        <div class="row">
          <div class="col-md-6">
            <div class="text-center">
              <h6 class="mb-3">Firma Digital</h6>
              ${photoUrl ? `
                <img src="${photoUrl}" 
                     alt="Firma Digital" 
                     class="signature-modal-image img-fluid" 
                     style="max-width: 100%; max-height: 250px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ` : '<p class="text-muted">No hay imagen disponible</p>'}
            </div>
          </div>
          <div class="col-md-6">
            <div class="text-left">
              <h6 class="mb-3">Información del Usuario</h6>
              <p><strong>Nombre:</strong><br>${user?.name || 'N/A'}</p>
              <p><strong>Email:</strong><br>${user?.email || 'N/A'}</p>
              <hr>
              <p><strong>ID Firma:</strong> ${originalSignature.id}</p>
              <p><strong>Creado:</strong><br>${this.formatDate(originalSignature.created_at)}</p>
              <p><strong>Actualizado:</strong><br>${this.formatDate(originalSignature.updated_at)}</p>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '<i class="fas fa-edit"></i> Editar',
      denyButtonText: '<i class="fas fa-trash"></i> Eliminar',
      cancelButtonText: '<i class="fas fa-times"></i> Cerrar',
      confirmButtonColor: '#28a745',
      denyButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      width: '700px',
      customClass: {
        popup: 'text-left'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.editSignature(originalSignature);
      } else if (result.isDenied) {
        this.deleteSignature(originalSignature);
      }
    });
  }

  // Crear nueva firma digital
  onAddSignature() {
    if (this.users.length === 0) {
      Swal.fire('Advertencia', 'Primero debe cargar la lista de usuarios', 'warning');
      return;
    }

    // Crear opciones para el select de usuarios
    const userOptions = this.users.map(user => 
      `<option value="${user.id}">${user.name} (ID: ${user.id})</option>`
    ).join('');

    Swal.fire({
      title: 'Crear Firma Digital',
      html: `
        <div class="text-left">
          <div class="form-group mb-3">
            <label for="userId" class="form-label"><strong>Usuario:</strong></label>
            <select id="userId" class="swal2-input" style="width: 100%;" required>
              <option value="">Selecciona un usuario</option>
              ${userOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="photo" class="form-label"><strong>Imagen de la Firma:</strong></label>
            <input id="photo" type="file" class="swal2-input" accept="image/*" required>
            <small class="text-muted">Formatos soportados: JPG, PNG, GIF</small>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Firma',
      cancelButtonText: 'Cancelar',
      width: '500px',
      preConfirm: () => {
        const userId = (document.getElementById('userId') as HTMLSelectElement).value;
        const photoInput = document.getElementById('photo') as HTMLInputElement;
        
        if (!userId) {
          Swal.showValidationMessage('Debe seleccionar un usuario');
          return false;
        }
        
        if (!photoInput.files || photoInput.files.length === 0) {
          Swal.showValidationMessage('Debe seleccionar una imagen');
          return false;
        }

        const file = photoInput.files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (file.size > maxSize) {
          Swal.showValidationMessage('La imagen no debe superar los 5MB');
          return false;
        }

        if (!file.type.startsWith('image/')) {
          Swal.showValidationMessage('Debe seleccionar un archivo de imagen válido');
          return false;
        }

        return { userId: parseInt(userId), photo: file };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { userId, photo } = result.value;
        
        Swal.fire({
          title: 'Creando firma digital...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.digitalSignatureService.create(userId, photo).subscribe({
          next: (createdSignature) => {
            Swal.fire('Éxito', 'Firma digital creada correctamente', 'success');
            this.loadDigitalSignatures(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error al crear firma digital:', error);
            const errorMessage = error?.error?.message || 'Error al crear la firma digital';
            Swal.fire('Error', errorMessage, 'error');
          }
        });
      }
    });
  }

  // Editar firma digital
  editSignature(signature: DigitalSignature) {
    Swal.fire({
      title: 'Editar Firma Digital',
      html: `
        <div class="text-left">
          <p><strong>Usuario:</strong> ${this.getUserName(signature.user_id)}</p>
          <div class="form-group">
            <label for="newPhoto" class="form-label"><strong>Nueva Imagen (opcional):</strong></label>
            <input id="newPhoto" type="file" class="swal2-input" accept="image/*">
            <small class="text-muted">Deje vacío para mantener la imagen actual</small>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      width: '500px',
      preConfirm: () => {
        const photoInput = document.getElementById('newPhoto') as HTMLInputElement;
        
        if (photoInput.files && photoInput.files.length > 0) {
          const file = photoInput.files[0];
          const maxSize = 5 * 1024 * 1024; // 5MB
          
          if (file.size > maxSize) {
            Swal.showValidationMessage('La imagen no debe superar los 5MB');
            return false;
          }

          if (!file.type.startsWith('image/')) {
            Swal.showValidationMessage('Debe seleccionar un archivo de imagen válido');
            return false;
          }

          return { photo: file };
        }
        
        return { photo: null };
      }
    }).then((result) => {
      if (result.isConfirmed && signature.id) {
        const { photo } = result.value;
        
        if (photo) {
          Swal.fire({
            title: 'Actualizando firma digital...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          this.digitalSignatureService.update(signature.id, photo).subscribe({
            next: (updatedSignature) => {
              Swal.fire('Éxito', 'Firma digital actualizada correctamente', 'success');
              this.loadDigitalSignatures(); // Recargar la lista
            },
            error: (error) => {
              console.error('Error al actualizar firma digital:', error);
              const errorMessage = error?.error?.message || 'Error al actualizar la firma digital';
              Swal.fire('Error', errorMessage, 'error');
            }
          });
        } else {
          Swal.fire('Info', 'No se realizaron cambios', 'info');
        }
      }
    });
  }

  // Eliminar firma digital
  deleteSignature(signature: DigitalSignature) {
    const userName = this.getUserName(signature.user_id);
    
    Swal.fire({
      title: '¿Eliminar firma digital?',
      text: `¿Estás seguro de eliminar la firma digital de ${userName}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed && signature.id) {
        this.digitalSignatureService.delete(signature.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Firma digital eliminada correctamente', 'success');
            this.loadDigitalSignatures(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error al eliminar firma digital:', error);
            const errorMessage = error?.error?.message || 'Error al eliminar la firma digital';
            Swal.fire('Error', errorMessage, 'error');
          }
        });
      }
    });
  }

  // Obtener nombre del usuario por ID
  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.name} (ID: ${user.id})` : `Usuario ID: ${userId}`;
  }

  // Ver firmas de un usuario específico
  viewUserSignatures(userId: number) {
    this.digitalSignatureService.getByUserId(userId).subscribe({
      next: (signatures) => {
        console.log(`Firmas del usuario ${userId}:`, signatures);
        // Aquí puedes implementar una vista específica si lo necesitas
      },
      error: (error) => {
        console.error('Error al cargar firmas del usuario:', error);
        Swal.fire('Error', 'Error al cargar las firmas del usuario', 'error');
      }
    });
  }
}
