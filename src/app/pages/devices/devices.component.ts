import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceService } from '../../services/device.service';
import { Device } from '../../models/device';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {
  
  // Configuración de la tabla CRUD
  title = 'Gestión de Dispositivos';
  headers = ['ID', 'Nombre', 'Dirección IP', 'Sistema Operativo', 'Usuario ID', 'Fecha Creación', 'Acciones'];
  devices: Device[] = [];
  displayData: any[] = []; // Datos filtrados para mostrar
  isLoading = false;
  users: User[] = []; // Lista de usuarios para el dropdown

  constructor(
    private deviceService: DeviceService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDevices();
    this.loadUsers();
  }

  // Cargar lista de usuarios para el dropdown
  loadUsers() {
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Usuarios cargados para dropdown:', users);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        // Cargar usuarios de ejemplo en caso de error
        this.users = [
          { id: 1, name: 'Usuario 1', email: 'user1@example.com', password: '' },
          { id: 2, name: 'Usuario 2', email: 'user2@example.com', password: '' },
          { id: 3, name: 'Usuario 3', email: 'user3@example.com', password: '' }
        ];
      }
    });
  }

  // Cargar lista de dispositivos
  loadDevices() {
    this.isLoading = true;
    this.deviceService.list().subscribe({
      next: (devices) => {
        this.devices = devices;
        // Filtrar datos para mostrar solo campos relevantes + botones
        this.displayData = devices.map(device => ({
          id: device.id,
          name: device.name,
          ip: device.ip,
          operating_system: device.operating_system,
          user_id: device.user_id,
          created_at: this.formatDate(device.created_at),
          acciones: '🔧', // Emoji de herramientas
          _originalDevice: device // Guardar dispositivo completo para operaciones
        }));
        console.log('Dispositivos cargados:', devices);
        console.log('Datos para tabla:', this.displayData);
      },
      error: (error) => {
        console.error('Error al cargar dispositivos:', error);
        Swal.fire('Error', 'Error al cargar la lista de dispositivos', 'error');
        // Cargar datos de ejemplo en caso de error
        this.loadExampleData();
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Cargar datos de ejemplo para testing
  loadExampleData(): void {
    const deviceInfo = this.deviceService.getDeviceInfo();
    
    this.displayData = [
      {
        id: 1,
        name: 'MacBook Pro',
        ip: '192.168.1.101',
        operating_system: 'macOS',
        user_id: 1,
        created_at: this.formatDate(new Date()),
        acciones: '🔧',
        _originalDevice: { 
          id: 1, 
          name: 'MacBook Pro', 
          ip: '192.168.1.101', 
          operating_system: 'macOS', 
          user_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: 2,
        name: 'iPhone 13',
        ip: '192.168.1.102',
        operating_system: 'iOS',
        user_id: 2,
        created_at: this.formatDate(new Date()),
        acciones: '🔧',
        _originalDevice: { 
          id: 2, 
          name: 'iPhone 13', 
          ip: '192.168.1.102', 
          operating_system: 'iOS', 
          user_id: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: 3,
        name: deviceInfo.operating_system === 'Unknown OS' ? 'Dispositivo Actual' : `PC ${deviceInfo.operating_system}`,
        ip: deviceInfo.ip,
        operating_system: deviceInfo.operating_system,
        user_id: 1,
        created_at: this.formatDate(new Date()),
        acciones: '🔧',
        _originalDevice: { 
          id: 3, 
          name: deviceInfo.operating_system === 'Unknown OS' ? 'Dispositivo Actual' : `PC ${deviceInfo.operating_system}`, 
          ip: deviceInfo.ip, 
          operating_system: deviceInfo.operating_system, 
          user_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, 'Fecha original:', date);
      return 'Error formato';
    }
  }

  // Métodos para contar dispositivos por tipo
  getMobileDevicesCount(): number {
    return this.displayData.filter(device => 
      device.operating_system && (
        device.operating_system.toLowerCase().includes('ios') ||
        device.operating_system.toLowerCase().includes('android')
      )
    ).length;
  }

  getComputersCount(): number {
    return this.displayData.filter(device => 
      device.operating_system && (
        device.operating_system.toLowerCase().includes('windows') ||
        device.operating_system.toLowerCase().includes('macos') ||
        device.operating_system.toLowerCase().includes('linux')
      )
    ).length;
  }

  getActiveUsersCount(): number {
    // Contar usuarios únicos que tienen dispositivos
    const uniqueUserIds = [...new Set(this.displayData.map(device => device.user_id))];
    return uniqueUserIds.length;
  }

  // Manejar evento de añadir dispositivo
  onAddDevice() {
    // Obtener información automática del dispositivo
    const deviceInfo = this.deviceService.getDeviceInfo();
    
    Swal.fire({
      title: 'Crear Nuevo Dispositivo',
      html: `
        <div class="form-group text-left">
          <label for="deviceName">Nombre del Dispositivo:</label>
          <input type="text" id="deviceName" class="form-control" placeholder="Ej: iPhone 13, MacBook Pro" required>
        </div>
        <div class="form-group text-left mt-3">
          <label for="deviceIp">Dirección IP:</label>
          <div class="input-group">
            <input type="text" id="deviceIp" class="form-control" value="${deviceInfo.ip}" required>
            <div class="input-group-append">
              <button type="button" id="autoDetectIp" class="btn btn-outline-secondary" title="Auto-detectar IP">🔄</button>
            </div>
          </div>
        </div>
        <div class="form-group text-left mt-3">
          <label for="deviceOs">Sistema Operativo:</label>
          <div class="input-group">
            <input type="text" id="deviceOs" class="form-control" value="${deviceInfo.operating_system}" required>
            <div class="input-group-append">
              <button type="button" id="autoDetectOs" class="btn btn-outline-secondary" title="Auto-detectar OS">🔄</button>
            </div>
          </div>
        </div>
        <div class="form-group text-left mt-3">
          <label for="userId">Usuario:</label>
          <select id="userId" class="form-control" required>
            <option value="">Seleccionar usuario...</option>
            ${this.users.map(user => `<option value="${user.id}">${user.name} (${user.email})</option>`).join('')}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Dispositivo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5e72e4',
      cancelButtonColor: '#6c757d',
      didOpen: () => {
        // Configurar botón de auto-detectar IP
        const autoDetectIpBtn = document.getElementById('autoDetectIp');
        const ipInput = document.getElementById('deviceIp') as HTMLInputElement;
        
        if (autoDetectIpBtn && ipInput) {
          autoDetectIpBtn.addEventListener('click', () => {
            const newDeviceInfo = this.deviceService.getDeviceInfo();
            ipInput.value = newDeviceInfo.ip;
          });
        }
        
        // Configurar botón de auto-detectar OS
        const autoDetectOsBtn = document.getElementById('autoDetectOs');
        const osInput = document.getElementById('deviceOs') as HTMLInputElement;
        
        if (autoDetectOsBtn && osInput) {
          autoDetectOsBtn.addEventListener('click', () => {
            const newDeviceInfo = this.deviceService.getDeviceInfo();
            osInput.value = newDeviceInfo.operating_system;
          });
        }
      },
      preConfirm: () => {
        const name = (document.getElementById('deviceName') as HTMLInputElement)?.value;
        const ip = (document.getElementById('deviceIp') as HTMLInputElement)?.value;
        const operating_system = (document.getElementById('deviceOs') as HTMLInputElement)?.value;
        const userId = (document.getElementById('userId') as HTMLSelectElement)?.value;
        
        if (!name || !ip || !operating_system || !userId) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }

        // Validar formato IP básico
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (!ipRegex.test(ip)) {
          Swal.showValidationMessage('Por favor ingresa una dirección IP válida');
          return false;
        }

        const userIdNum = parseInt(userId);
        if (userIdNum <= 0) {
          Swal.showValidationMessage('Por favor selecciona un usuario válido');
          return false;
        }
        
        return { 
          name, 
          ip, 
          operating_system, 
          userId: userIdNum 
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.createDevice(result.value);
      }
    });
  }

  // Manejar click en fila
  onRowClick(event: any) {
    const displayedRow = event.row;
    const originalDevice = displayedRow._originalDevice; // Dispositivo completo del backend
    
    console.log('Dispositivo seleccionado:', originalDevice);
    
    const userName = this.users.find(u => u.id === originalDevice.user_id)?.name || `Usuario ID: ${originalDevice.user_id}`;
    
    Swal.fire({
      title: `Dispositivo: ${originalDevice.name}`,
      html: `
        <div class="text-left">
          <p><strong>ID:</strong> ${originalDevice.id}</p>
          <p><strong>Nombre:</strong> ${originalDevice.name}</p>
          <p><strong>Dirección IP:</strong> ${originalDevice.ip}</p>
          <p><strong>Sistema Operativo:</strong> ${originalDevice.operating_system}</p>
          <p><strong>Usuario:</strong> ${userName}</p>
          <p><strong>Fecha Creación:</strong> ${this.formatDate(originalDevice.created_at)}</p>
          <p><strong>Fecha Actualización:</strong> ${this.formatDate(originalDevice.updated_at)}</p>
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
        this.editDevice(originalDevice);
      } else if (result.isDenied) {
        this.deleteDevice(originalDevice);
      }
    });
  }

  // Crear dispositivo
  createDevice(deviceData: { name: string; ip: string; operating_system: string; userId: number }): void {
    console.log('Intentando crear dispositivo con datos:', deviceData);
    
    const devicePayload = {
      name: deviceData.name,
      ip: deviceData.ip,
      operating_system: deviceData.operating_system
    };
    
    this.deviceService.create(deviceData.userId, devicePayload).subscribe({
      next: (newDevice: Device) => {
        console.log('Dispositivo creado exitosamente:', newDevice);
        Swal.fire({
          title: '¡Éxito!',
          text: 'Dispositivo creado correctamente',
          icon: 'success',
          confirmButtonColor: '#5e72e4'
        });
        this.loadDevices(); // Recargar la tabla
      },
      error: (error) => {
        console.error('Error al crear dispositivo:', error);
        console.log('URL:', error.url);
        console.log('Datos enviados:', devicePayload);
        console.log('User ID:', deviceData.userId);
        
        // Para demo, agregar localmente con ID único
        const uniqueId = Date.now() + Math.floor(Math.random() * 10000);
        const deviceWithId = { 
          ...devicePayload, 
          id: uniqueId, 
          user_id: deviceData.userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const newDevice = {
          id: uniqueId,
          name: deviceData.name,
          ip: deviceData.ip,
          operating_system: deviceData.operating_system,
          user_id: deviceData.userId,
          created_at: this.formatDate(new Date()),
          acciones: '🔧',
          _originalDevice: deviceWithId
        };
        this.displayData.push(newDevice);
        
        Swal.fire({
          title: '¡Simulación!',
          text: 'Dispositivo agregado localmente (modo demo)',
          icon: 'info',
          confirmButtonColor: '#5e72e4'
        });
      }
    });
  }

  // Editar dispositivo
  editDevice(device: Device): void {
    // Obtener información automática del dispositivo
    const deviceInfo = this.deviceService.getDeviceInfo();
    
    Swal.fire({
      title: 'Editar Dispositivo',
      html: `
        <div class="form-group text-left">
          <label for="editDeviceName">Nombre del Dispositivo:</label>
          <input type="text" id="editDeviceName" class="form-control" value="${device.name}" required>
        </div>
        <div class="form-group text-left mt-3">
          <label for="editDeviceIp">Dirección IP:</label>
          <div class="input-group">
            <input type="text" id="editDeviceIp" class="form-control" value="${device.ip}" required>
            <div class="input-group-append">
              <button type="button" id="editAutoDetectIp" class="btn btn-outline-secondary" title="Auto-detectar IP">🔄</button>
            </div>
          </div>
        </div>
        <div class="form-group text-left mt-3">
          <label for="editDeviceOs">Sistema Operativo:</label>
          <div class="input-group">
            <input type="text" id="editDeviceOs" class="form-control" value="${device.operating_system}" required>
            <div class="input-group-append">
              <button type="button" id="editAutoDetectOs" class="btn btn-outline-secondary" title="Auto-detectar OS">🔄</button>
            </div>
          </div>
        </div>
        <div class="form-group text-left mt-3">
          <label for="editUserId">Usuario:</label>
          <select id="editUserId" class="form-control" required>
            <option value="">Seleccionar usuario...</option>
            ${this.users.map(user => `<option value="${user.id}" ${user.id === device.user_id ? 'selected' : ''}>${user.name} (${user.email})</option>`).join('')}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5e72e4',
      cancelButtonColor: '#6c757d',
      didOpen: () => {
        // Configurar botones de auto-detección
        const autoDetectIpBtn = document.getElementById('editAutoDetectIp');
        const ipInput = document.getElementById('editDeviceIp') as HTMLInputElement;
        
        if (autoDetectIpBtn && ipInput) {
          autoDetectIpBtn.addEventListener('click', () => {
            const newDeviceInfo = this.deviceService.getDeviceInfo();
            ipInput.value = newDeviceInfo.ip;
          });
        }
        
        const autoDetectOsBtn = document.getElementById('editAutoDetectOs');
        const osInput = document.getElementById('editDeviceOs') as HTMLInputElement;
        
        if (autoDetectOsBtn && osInput) {
          autoDetectOsBtn.addEventListener('click', () => {
            const newDeviceInfo = this.deviceService.getDeviceInfo();
            osInput.value = newDeviceInfo.operating_system;
          });
        }
      },
      preConfirm: () => {
        const name = (document.getElementById('editDeviceName') as HTMLInputElement)?.value;
        const ip = (document.getElementById('editDeviceIp') as HTMLInputElement)?.value;
        const operating_system = (document.getElementById('editDeviceOs') as HTMLInputElement)?.value;
        const userId = (document.getElementById('editUserId') as HTMLSelectElement)?.value;
        
        if (!name || !ip || !operating_system || !userId) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }

        // Validar formato IP básico
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (!ipRegex.test(ip)) {
          Swal.showValidationMessage('Por favor ingresa una dirección IP válida');
          return false;
        }

        const userIdNum = parseInt(userId);
        if (userIdNum <= 0) {
          Swal.showValidationMessage('Por favor selecciona un usuario válido');
          return false;
        }
        
        return { 
          name, 
          ip, 
          operating_system, 
          userId: userIdNum 
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.updateDevice(device.id!, result.value);
      }
    });
  }

  // Actualizar dispositivo
  updateDevice(deviceId: number, deviceData: { name: string; ip: string; operating_system: string; userId: number }): void {
    const updatePayload = {
      name: deviceData.name,
      ip: deviceData.ip,
      operating_system: deviceData.operating_system,
      user_id: deviceData.userId
    };
    
    this.deviceService.update(deviceId, updatePayload).subscribe({
      next: (updatedDevice: Device) => {
        console.log('Dispositivo actualizado exitosamente:', updatedDevice);
        Swal.fire({
          title: '¡Éxito!',
          text: 'Dispositivo actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#5e72e4'
        });
        this.loadDevices(); // Recargar la tabla
      },
      error: (error) => {
        console.error('Error al actualizar dispositivo:', error);
        
        // Para demo, actualizar localmente
        const deviceIndex = this.displayData.findIndex(d => d.id === deviceId);
        if (deviceIndex !== -1) {
          this.displayData[deviceIndex] = {
            ...this.displayData[deviceIndex],
            name: deviceData.name,
            ip: deviceData.ip,
            operating_system: deviceData.operating_system,
            user_id: deviceData.userId,
            _originalDevice: {
              ...this.displayData[deviceIndex]._originalDevice,
              name: deviceData.name,
              ip: deviceData.ip,
              operating_system: deviceData.operating_system,
              user_id: deviceData.userId,
              updated_at: new Date().toISOString()
            }
          };
        }
        
        Swal.fire({
          title: '¡Simulación!',
          text: 'Dispositivo actualizado localmente (modo demo)',
          icon: 'info',
          confirmButtonColor: '#5e72e4'
        });
      }
    });
  }

  // Eliminar dispositivo
  deleteDevice(device: Device): void {
    const userName = this.users.find(u => u.id === device.user_id)?.name || `Usuario ID: ${device.user_id}`;
    
    Swal.fire({
      title: '¿Eliminar dispositivo?',
      text: `¿Estás seguro de eliminar "${device.name}" del usuario ${userName}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed && device.id) {
        this.deviceService.delete(device.id).subscribe({
          next: () => {
            console.log('Dispositivo eliminado exitosamente');
            Swal.fire({
              title: '¡Eliminado!',
              text: 'Dispositivo eliminado correctamente',
              icon: 'success',
              confirmButtonColor: '#5e72e4'
            });
            this.loadDevices(); // Recargar la tabla
          },
          error: (error) => {
            console.error('Error al eliminar dispositivo:', error);
            
            // Para demo, eliminar localmente
            this.displayData = this.displayData.filter(d => d.id !== device.id);
            
            Swal.fire({
              title: '¡Simulación!',
              text: 'Dispositivo eliminado localmente (modo demo)',
              icon: 'info',
              confirmButtonColor: '#5e72e4'
            });
          }
        });
      }
    });
  }
}
