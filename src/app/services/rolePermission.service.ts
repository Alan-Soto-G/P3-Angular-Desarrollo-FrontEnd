import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolePermission } from '../models/rolePermission.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {

  constructor(private http: HttpClient) { }

  // Obtener todas las asignaciones
  list(): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(`${environment.url_ms_security}/role-permissions`);
  }

  // Obtener asignaciones por rol
  getByRole(roleId: number): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(`${environment.url_ms_security}/role-permissions/role/${roleId}`);
  }

  // Crear una nueva asignación
  create(rolePermission: RolePermission): Observable<RolePermission> {
    return this.http.post<RolePermission>(`${environment.url_ms_security}/role-permissions`, rolePermission);
  }

  // Actualizar una asignación existente
  update(rolePermission: RolePermission): Observable<RolePermission> {
    return this.http.put<RolePermission>(`${environment.url_ms_security}/role-permissions/${rolePermission.id}`, rolePermission);
  }

  // Eliminar una asignación
  delete(id: string): Observable<any> {
    return this.http.delete(`${environment.url_ms_security}/role-permissions/${id}`);
  }
}