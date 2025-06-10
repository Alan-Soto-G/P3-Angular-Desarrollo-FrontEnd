import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RoleService {

    constructor(private http: HttpClient) { }

    // Obtener todos los roles: GET /api/roles
    list(): Observable<Role[]> {
        return this.http.get<Role[]>(`${environment.url_ms_security}/roles`);
    }

    // Obtener rol por ID: GET /api/roles/{id}
    view(id: number): Observable<Role> {
        return this.http.get<Role>(`${environment.url_ms_security}/roles/${id}`);
    }

    // Crear rol: POST /api/roles
    create(newRole: Role): Observable<Role> {
        const roleToCreate = {
            name: newRole.name,
            description: newRole.description || ''
        };
        return this.http.post<Role>(`${environment.url_ms_security}/roles`, roleToCreate);
    }

    // Actualizar rol: PUT /api/roles/{id}
    update(theRole: Role): Observable<Role> {
        const roleToUpdate = {
            name: theRole.name,
            description: theRole.description || ''
        };
        return this.http.put<Role>(`${environment.url_ms_security}/roles/${theRole.id}`, roleToUpdate);
    }

    // Eliminar rol: DELETE /api/roles/{id}
    delete(id: number): Observable<any> {
        return this.http.delete(`${environment.url_ms_security}/roles/${id}`);
    }
}