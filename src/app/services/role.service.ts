import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Role {
    _id?: string;
    name: string;
    description: string;
    permissions?: string[];
    created_at?: Date;
    updated_at?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private baseUrl = `${environment.url_ms_security}/roles`;

    constructor(private http: HttpClient) { }

    /**
     * Get all roles
     */
    list(): Observable<Role[]> {
        return this.http.get<Role[]>(this.baseUrl);
    }

    /**
     * Get role by ID
     */
    view(id: string): Observable<Role> {
        return this.http.get<Role>(`${this.baseUrl}/${id}`);
    }

    /**
     * Create new role
     */
    create(role: Omit<Role, '_id' | 'created_at' | 'updated_at'>): Observable<Role> {
        return this.http.post<Role>(this.baseUrl, role);
    }

    /**
     * Update existing role
     */
    update(id: string, role: Partial<Role>): Observable<Role> {
        return this.http.put<Role>(`${this.baseUrl}/${id}`, role);
    }

    /**
     * Delete role
     */
    delete(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }
}