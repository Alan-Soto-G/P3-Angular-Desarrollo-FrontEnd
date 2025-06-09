import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PasswordService, Password } from '../../services/password.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
  
  // Configuración de la tabla CRUD
  title = 'Gestión de Contraseñas';
  headers = ['ID', 'Contenido', 'Fecha Inicio', 'Fecha Fin', 'Usuario ID', 'Acciones', 'Estado'];
  passwords: Password[] = [];
  displayData: any[] = []; // Datos filtrados para mostrar
  isLoading = false;

  constructor(
    private passwordService: PasswordService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPasswords();
  }

  // Cargar lista de contraseñas
  loadPasswords() {
    this.isLoading = true;
    this.passwordService.list().subscribe({
      next: (passwords) => {
        this.passwords = passwords;
        // Filtrar datos para mostrar solo campos relevantes + botones
        this.displayData = passwords.map(password => ({
          id: password.id,
          content: '••••••••', // Ocultar contenido por seguridad
          startAt: this.formatDate(password.startAt),
          endAt: this.formatDate(password.endAt),
          userId: password.userId,
          acciones: '🔧', // Emoji de herramientas
          estado: this.getPasswordStatus(password), // Estado basado en fechas
          _originalPassword: password // Guardar contraseña completa para operaciones
        }));
        console.log('Contraseñas cargadas:', passwords);
        console.log('Datos para tabla:', this.displayData);
      },
      error: (error) => {
        console.error('Error al cargar contraseñas:', error);
        Swal.fire('Error', 'Error al cargar la lista de contraseñas', 'error');
        // Cargar datos de ejemplo en caso de error
        this.loadExampleData();
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }  // Cargar datos de ejemplo para testing
  loadExampleData(): void {
    const now = new Date();
    const pastDate = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)); // 10 días atrás
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 días después
    const expiredDate = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)); // 5 días atrás
    
    // Generar contraseñas de ejemplo diferentes con longitudes variadas
    const password1 = this.generateSecurePassword(12);
    const password2 = this.generateSecurePassword(10);
    const password3 = this.generateSecurePassword(14);
    
    this.displayData = [
      {
        id: this.generateUniqueId(),
        content: '••••••••',
        startAt: this.formatDate(now),
        endAt: this.formatDate(futureDate),
        userId: 1,
        acciones: '🔧',
        estado: '✅ Activa',
        _originalPassword: { 
          id: 1, 
          content: password1, 
          startAt: now, 
          endAt: futureDate, 
          userId: 1,
          createdAt: now
        }
      },
      {
        id: this.generateUniqueId(),
        content: '••••••••',
        startAt: this.formatDate(pastDate),
        endAt: this.formatDate(expiredDate),
        userId: 2,
        acciones: '🔧',
        estado: '❌ Expirada',
        _originalPassword: { 
          id: 2, 
          content: password2, 
          startAt: pastDate, 
          endAt: expiredDate, 
          userId: 2,
          createdAt: pastDate
        }
      },
      {
        id: this.generateUniqueId(),
        content: '••••••••',
        startAt: this.formatDate(new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000))),
        endAt: this.formatDate(new Date(now.getTime() + (25 * 24 * 60 * 60 * 1000))),
        userId: 3,
        acciones: '🔧',
        estado: '⏳ Pendiente',
        _originalPassword: { 
          id: 3, 
          content: password3, 
          startAt: new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000)), 
          endAt: new Date(now.getTime() + (25 * 24 * 60 * 60 * 1000)), 
          userId: 3,
          createdAt: now
        }
      }
    ];
    console.log('Datos de ejemplo cargados:', this.displayData);
    this.isLoading = false;
  }
  // Formatear fecha para mostrar
  formatDate(date: Date | string | undefined | null): string {
    if (!date) return 'N/A';
    
    try {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date(date as any);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        console.warn('Fecha inválida recibida:', date);
        return 'Fecha inválida';
      }
      
      // Formatear fecha de manera simple y consistente
      return dateObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, 'Fecha original:', date);
      return 'Error formato';
    }
  }  // Determinar estado de la contraseña
  getPasswordStatus(password: Password | any): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Resetear horas para comparación solo de fechas
    
    let startDate: Date;
    let endDate: Date;
    
    // Asegurar que las fechas sean objetos Date válidos
    if (password.startAt instanceof Date) {
      startDate = new Date(password.startAt);
    } else {
      startDate = new Date(password.startAt);
    }
    
    if (password.endAt instanceof Date) {
      endDate = new Date(password.endAt);
    } else {
      endDate = new Date(password.endAt);
    }
    
    // Resetear horas para comparación solo de fechas
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    // Verificar fechas válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return '❓ Error fecha';
    }
    
    if (startDate > now) {
      return '⏳ Pendiente';
    } else if (endDate < now) {
      return '❌ Expirada';
    } else {
      return '✅ Activa';
    }
  }
  // Métodos para contar contraseñas por estado
  getActivePasswordsCount(): number {
    return this.displayData.filter(password => 
      password.estado === '✅ Activa'
    ).length;
  }

  getExpiredPasswordsCount(): number {
    return this.displayData.filter(password => 
      password.estado === '❌ Expirada'
    ).length;
  }

  getPendingPasswordsCount(): number {
    return this.displayData.filter(password => 
      password.estado === '⏳ Pendiente'
    ).length;
  }
  // Generar contraseña segura aleatoria mejorada
  generateSecurePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(numbers);
    password += this.getRandomChar(symbols);
    
    // Completar el resto de la contraseña con caracteres aleatorios
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 4; i < length; i++) {
      password += this.getRandomChar(allChars);
    }
    
    // Mezclar los caracteres usando el algoritmo Fisher-Yates
    return this.shuffleString(password);
  }

  // Obtener carácter aleatorio de una cadena
  private getRandomChar(chars: string): string {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Mezclar cadena usando algoritmo Fisher-Yates
  private shuffleString(str: string): string {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }
  // Generar ID único más robusto
  generateUniqueId(): number {
    return Date.now() + Math.floor(Math.random() * 10000);
  }
  // Manejar evento de añadir contraseña
  onAddPassword() {
    // Generar valores por defecto
    const today = new Date();
    const defaultStartDate = today.toISOString().split('T')[0];
    const defaultEndDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    const randomPassword = this.generateSecurePassword();
    
    Swal.fire({
      title: 'Crear Nueva Contraseña',
      html: `
        <div class="form-group text-left">
          <label for="content">Contenido de la Contraseña:</label>
          <div class="input-group">
            <input type="password" id="content" class="form-control" placeholder="Contraseña generada automáticamente" value="${randomPassword}" required>
            <div class="input-group-append">
              <button type="button" id="generateBtn" class="btn btn-outline-secondary" title="Generar nueva contraseña">🔄</button>
              <button type="button" id="toggleBtn" class="btn btn-outline-secondary" title="Mostrar/Ocultar">👁️</button>
            </div>
          </div>
        </div>
        <div class="form-group text-left mt-3">
          <label for="startAt">Fecha de Inicio:</label>
          <input type="date" id="startAt" class="form-control" value="${defaultStartDate}" required>
        </div>
        <div class="form-group text-left mt-3">
          <label for="endAt">Fecha de Fin:</label>
          <input type="date" id="endAt" class="form-control" value="${defaultEndDate}" required>
        </div>
        <div class="form-group text-left mt-3">
          <label for="userId">ID de Usuario:</label>
          <input type="number" id="userId" class="form-control" placeholder="ID del usuario" min="1" required>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Contraseña',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5e72e4',
      cancelButtonColor: '#6c757d',
      didOpen: () => {
        // Configurar botón de generar contraseña
        const generateBtn = document.getElementById('generateBtn');
        const contentInput = document.getElementById('content') as HTMLInputElement;
        const toggleBtn = document.getElementById('toggleBtn');
        
        if (generateBtn && contentInput) {
          generateBtn.addEventListener('click', () => {
            const newPassword = this.generateSecurePassword();
            contentInput.value = newPassword;
          });
        }
        
        // Configurar botón de mostrar/ocultar contraseña
        if (toggleBtn && contentInput) {
          toggleBtn.addEventListener('click', () => {
            if (contentInput.type === 'password') {
              contentInput.type = 'text';
              toggleBtn.innerHTML = '🙈';
            } else {
              contentInput.type = 'password';
              toggleBtn.innerHTML = '👁️';
            }
          });
        }
      },      preConfirm: () => {
        const content = (document.getElementById('content') as HTMLInputElement)?.value;
        const startAt = (document.getElementById('startAt') as HTMLInputElement)?.value;
        const endAt = (document.getElementById('endAt') as HTMLInputElement)?.value;
        const userId = (document.getElementById('userId') as HTMLInputElement)?.value;
        
        if (!content || !startAt || !endAt || !userId) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }

        const startDate = new Date(startAt);
        const endDate = new Date(endAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Resetear horas para comparación solo de fechas

        if (startDate >= endDate) {
          Swal.showValidationMessage('La fecha de fin debe ser posterior a la fecha de inicio');
          return false;
        }

        if (endDate <= today) {
          Swal.showValidationMessage('La fecha de fin debe ser futura');
          return false;
        }

        const userIdNum = parseInt(userId);
        if (userIdNum <= 0) {
          Swal.showValidationMessage('El ID de usuario debe ser un número positivo');
          return false;
        }

        // Validar longitud de contraseña
        if (content.length < 8) {
          Swal.showValidationMessage('La contraseña debe tener al menos 8 caracteres');
          return false;
        }
        
        return { 
          content, 
          startAt: startDate, 
          endAt: endDate, 
          userId: userIdNum 
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.createPassword(result.value);
      }
    });
  }
  // Manejar click en fila
  onRowClick(event: any) {
    const displayedRow = event.row;
    const originalPassword = displayedRow._originalPassword; // Contraseña completa del backend
    
    console.log('Contraseña seleccionada:', originalPassword);
    
    // Estado para controlar si la contraseña es visible
    let isPasswordVisible = false;
    
    const showPasswordModal = () => {
      const passwordDisplay = isPasswordVisible 
        ? originalPassword.content 
        : '•'.repeat(originalPassword.content?.length || 8);
      
      const toggleButtonText = isPasswordVisible ? '🙈 Ocultar' : '👁️ Mostrar';
      
      Swal.fire({
        title: `Contraseña ID: ${originalPassword.id}`,
        html: `
          <div class="text-left">
            <p><strong>ID:</strong> ${originalPassword.id}</p>
            <p><strong>Contenido:</strong> <span id="password-display">${passwordDisplay}</span></p>
            <p><strong>Fecha Inicio:</strong> ${this.formatDate(originalPassword.startAt)}</p>
            <p><strong>Fecha Fin:</strong> ${this.formatDate(originalPassword.endAt)}</p>
            <p><strong>Usuario ID:</strong> ${originalPassword.userId}</p>
            <p><strong>Estado:</strong> ${this.getPasswordStatus(originalPassword)}</p>
            <p><strong>Fecha Creación:</strong> ${originalPassword.createdAt ? this.formatDate(originalPassword.createdAt) : 'N/A'}</p>
          </div>
          <div class="mt-3">
            <button id="toggle-password" class="btn btn-sm btn-info">${toggleButtonText} Contraseña</button>
          </div>
        `,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '<i class="fas fa-edit"></i> Editar',
        denyButtonText: '<i class="fas fa-trash"></i> Eliminar',
        cancelButtonText: 'Cerrar',
        confirmButtonColor: '#28a745',
        denyButtonColor: '#dc3545',
        didOpen: () => {
          // Agregar event listener al botón de toggle
          const toggleBtn = document.getElementById('toggle-password');
          const passwordSpan = document.getElementById('password-display');
          
          if (toggleBtn && passwordSpan) {
            toggleBtn.addEventListener('click', () => {
              isPasswordVisible = !isPasswordVisible;
              const newPasswordDisplay = isPasswordVisible 
                ? originalPassword.content 
                : '•'.repeat(originalPassword.content?.length || 8);
              const newButtonText = isPasswordVisible ? '🙈 Ocultar' : '👁️ Mostrar';
              
              passwordSpan.textContent = newPasswordDisplay;
              toggleBtn.innerHTML = `${newButtonText} Contraseña`;
            });
          }
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.editPassword(originalPassword);
        } else if (result.isDenied) {
          this.deletePassword(originalPassword);
        }
      });
    };
    
    showPasswordModal();
  }  // Crear contraseña
  createPassword(passwordData: { content: string; startAt: Date; endAt: Date; userId: number }): void {
    console.log('Intentando crear contraseña con datos:', passwordData);
    
    this.passwordService.create(passwordData).subscribe({
      next: (newPassword: Password) => {
        console.log('Contraseña creada exitosamente:', newPassword);
        Swal.fire({
          title: '¡Éxito!',
          text: 'Contraseña creada correctamente',
          icon: 'success',
          confirmButtonColor: '#5e72e4'
        });
        this.loadPasswords(); // Recargar la tabla
      },
      error: (error) => {
        console.error('Error al crear contraseña:', error);
        console.log('URL:', error.url);
        console.log('Datos enviados:', passwordData);
        
        // Para demo, agregar localmente con ID único
        const uniqueId = this.generateUniqueId();
        const passwordWithId = { ...passwordData, id: uniqueId };
        
        const newPassword = {
          id: uniqueId,
          content: '••••••••',
          startAt: this.formatDate(passwordData.startAt),
          endAt: this.formatDate(passwordData.endAt),
          userId: passwordData.userId,
          acciones: '🔧',
          estado: this.getPasswordStatus(passwordWithId),
          _originalPassword: passwordWithId
        };
        this.displayData.push(newPassword);
        
        Swal.fire({
          title: '¡Simulación!',
          text: 'Contraseña agregada localmente (modo demo)',
          icon: 'info',
          confirmButtonColor: '#5e72e4'
        });
      }
    });
  }
  // Editar contraseña
  editPassword(password: Password): void {
    // Formatear fechas para el input date (YYYY-MM-DD)
    const formatDateForInput = (date: Date | string): string => {
      try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) {
          return new Date().toISOString().split('T')[0];
        }
        return dateObj.toISOString().split('T')[0];
      } catch {
        return new Date().toISOString().split('T')[0];
      }
    };
    
    Swal.fire({
      title: 'Editar Contraseña',
      html: `
        <div class="form-group text-left">
          <label for="editContent">Contenido de la Contraseña:</label>
          <div class="input-group">
            <input type="password" id="editContent" class="form-control" value="${password.content}" required>
            <div class="input-group-append">
              <button type="button" id="editGenerateBtn" class="btn btn-outline-secondary" title="Generar nueva contraseña">🔄</button>
              <button type="button" id="editToggleBtn" class="btn btn-outline-secondary" title="Mostrar/Ocultar">👁️</button>
            </div>
          </div>
        </div>
        <div class="form-group text-left mt-3">
          <label for="editStartAt">Fecha de Inicio:</label>
          <input type="date" id="editStartAt" class="form-control" value="${formatDateForInput(password.startAt)}" required>
        </div>
        <div class="form-group text-left mt-3">
          <label for="editEndAt">Fecha de Fin:</label>
          <input type="date" id="editEndAt" class="form-control" value="${formatDateForInput(password.endAt)}" required>
        </div>
        <div class="form-group text-left mt-3">
          <label for="editUserId">ID de Usuario:</label>
          <input type="number" id="editUserId" class="form-control" value="${password.userId}" min="1" required>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5e72e4',
      cancelButtonColor: '#6c757d',
      didOpen: () => {
        // Configurar botones
        const generateBtn = document.getElementById('editGenerateBtn');
        const contentInput = document.getElementById('editContent') as HTMLInputElement;
        const toggleBtn = document.getElementById('editToggleBtn');
        
        if (generateBtn && contentInput) {
          generateBtn.addEventListener('click', () => {
            const newPassword = this.generateSecurePassword();
            contentInput.value = newPassword;
          });
        }
        
        if (toggleBtn && contentInput) {
          toggleBtn.addEventListener('click', () => {
            if (contentInput.type === 'password') {
              contentInput.type = 'text';
              toggleBtn.innerHTML = '🙈';
            } else {
              contentInput.type = 'password';
              toggleBtn.innerHTML = '👁️';
            }
          });
        }
      },      preConfirm: () => {
        const content = (document.getElementById('editContent') as HTMLInputElement)?.value;
        const startAt = (document.getElementById('editStartAt') as HTMLInputElement)?.value;
        const endAt = (document.getElementById('editEndAt') as HTMLInputElement)?.value;
        const userId = (document.getElementById('editUserId') as HTMLInputElement)?.value;
        
        if (!content || !startAt || !endAt || !userId) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }

        const startDate = new Date(startAt);
        const endDate = new Date(endAt);

        if (startDate >= endDate) {
          Swal.showValidationMessage('La fecha de fin debe ser posterior a la fecha de inicio');
          return false;
        }

        const userIdNum = parseInt(userId);
        if (userIdNum <= 0) {
          Swal.showValidationMessage('El ID de usuario debe ser un número positivo');
          return false;
        }

        // Validar longitud de contraseña
        if (content.length < 8) {
          Swal.showValidationMessage('La contraseña debe tener al menos 8 caracteres');
          return false;
        }
        
        return { 
          content, 
          startAt: startDate, 
          endAt: endDate, 
          userId: userIdNum 
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.updatePassword(password.id!, result.value);
      }
    });
  }

  // Actualizar contraseña
  updatePassword(passwordId: number, passwordData: { content: string; startAt: Date; endAt: Date; userId: number }): void {
    this.passwordService.update(passwordId, passwordData).subscribe({
      next: (updatedPassword: Password) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Contraseña actualizada correctamente',
          icon: 'success',
          confirmButtonColor: '#5e72e4'
        });
        this.loadPasswords(); // Recargar la tabla
      },
      error: (error) => {
        console.error('Error al actualizar contraseña:', error);
        // Para demo, actualizar localmente
        const passwordIndex = this.displayData.findIndex(p => p._originalPassword.id === passwordId);
        if (passwordIndex !== -1) {
          const updatedOriginal = { ...this.displayData[passwordIndex]._originalPassword, ...passwordData };
          this.displayData[passwordIndex] = {
            ...this.displayData[passwordIndex],
            content: '••••••••',
            startAt: this.formatDate(passwordData.startAt),
            endAt: this.formatDate(passwordData.endAt),
            userId: passwordData.userId,
            estado: this.getPasswordStatus(updatedOriginal),
            _originalPassword: updatedOriginal
          };
        }
        
        Swal.fire({
          title: '¡Simulación!',
          text: 'Contraseña actualizada localmente (modo demo)',
          icon: 'info',
          confirmButtonColor: '#5e72e4'
        });
      }
    });
  }

  // Eliminar contraseña
  deletePassword(password: Password): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la contraseña del usuario ${password.userId}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.passwordService.delete(password.id!).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminada!',
              text: 'La contraseña ha sido eliminada correctamente',
              icon: 'success',
              confirmButtonColor: '#5e72e4'
            });
            this.loadPasswords(); // Recargar la tabla
          },
          error: (error) => {
            console.error('Error al eliminar contraseña:', error);
            // Para demo, eliminar localmente
            this.displayData = this.displayData.filter(p => p._originalPassword.id !== password.id);
            
            Swal.fire({
              title: '¡Simulación!',
              text: 'Contraseña eliminada localmente (modo demo)',
              icon: 'info',
              confirmButtonColor: '#5e72e4'
            });
          }
        });
      }
    });
  }
}
