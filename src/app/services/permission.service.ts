import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission } from '../models/permission.model';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {

    constructor(private http: HttpClient) { }

    // Obtener todos los permisos: GET /api/permissions
    list(): Observable<Permission[]> {
        return this.http.get<Permission[]>(`${environment.url_ms_security}/permissions`);
    }

    // Obtener permiso por ID: GET /api/permissions/{id}
    view(id: number): Observable<Permission> {
        return this.http.get<Permission>(`${environment.url_ms_security}/permissions/${id}`);
    }

    // Crear permiso: POST /api/permissions
create(newPermission: Permission): Observable<Permission> {
    // Función auxiliar para extraer la entidad de la URL.
    // Por ejemplo, si la URL es "/dfvcv", se obtendrá "dfvcv"
    const extractEntity = (url: string): string => {
        const segments = url.split('/').filter(seg => seg.length > 0);
        return segments.length > 0 ? segments[0] : '';
    };

    const permissionToCreate = {
        url: newPermission.url,
        method: newPermission.method,
        entity: extractEntity(newPermission.url)  // Se agrega la propiedad necesaria
    };

    return this.http.post<Permission>(`${environment.url_ms_security}/permissions`, permissionToCreate);
}

    // Actualizar permiso: PUT /api/permissions/{id}
    update(thePermission: Permission): Observable<Permission> {
        return this.http.put<Permission>(`${environment.url_ms_security}/permissions/${thePermission.id}`, thePermission);
    }

    // Eliminar permiso: DELETE /api/permissions/{id}
    delete(id: number): Observable<any> {
        return this.http.delete(`${environment.url_ms_security}/permissions/${id}`);
    }
}