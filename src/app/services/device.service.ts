import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Device } from '../models/device';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private baseUrl = `${environment.url_ms_security}/devices`;

  constructor(private http: HttpClient) { }

  // Obtener todos los dispositivos
  list(): Observable<Device[]> {
    return this.http.get<Device[]>(this.baseUrl);
  }

  // Obtener dispositivo por ID
  view(id: number): Observable<Device> {
    return this.http.get<Device>(`${this.baseUrl}/${id}`);
  }

  // Obtener dispositivos por usuario
  getByUser(userId: number): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.baseUrl}/user/${userId}`);
  }

  // Crear dispositivo para un usuario específico
  create(userId: number, device: Omit<Device, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Observable<Device> {
    return this.http.post<Device>(`${this.baseUrl}/user/${userId}`, device);
  }

  // Actualizar dispositivo
  update(id: number, device: Partial<Device>): Observable<Device> {
    return this.http.put<Device>(`${this.baseUrl}/${id}`, device);
  }

  // Eliminar dispositivo
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Obtener información del dispositivo actual automáticamente
  getDeviceInfo(): { ip: string; operating_system: string } {
    // Detectar sistema operativo
    const userAgent = navigator.userAgent;
    let os = 'Unknown OS';
    
    if (userAgent.indexOf('Win') !== -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
    else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
    else if (userAgent.indexOf('Android') !== -1) os = 'Android';
    else if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) os = 'iOS';

    // Para la IP, en un entorno real necesitarías un servicio externo
    // Por ahora retornamos una IP local simulada
    const ip = '192.168.1.' + Math.floor(Math.random() * 255);

    return {
      ip: ip,
      operating_system: os
    };
  }
}
