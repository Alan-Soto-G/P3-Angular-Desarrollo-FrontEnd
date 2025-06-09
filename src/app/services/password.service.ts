import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Password {
    id?: number;
    content: string;
    startAt: Date;
    endAt: Date;
    userId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class PasswordService {
    private apiUrl = `${environment.url_ms_security}/passwords`;

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient) { }

    // Obtener lista de contraseñas
    list(): Observable<Password[]> {
        return this.http.get<Password[]>(this.apiUrl, this.httpOptions);
    }

    // Obtener contraseña por ID
    get(id: number): Observable<Password> {
        return this.http.get<Password>(`${this.apiUrl}/${id}`, this.httpOptions);
    }

    // Crear nueva contraseña
    create(password: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>): Observable<Password> {
        return this.http.post<Password>(this.apiUrl, password, this.httpOptions);
    }

    // Actualizar contraseña
    update(id: number, password: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>): Observable<Password> {
        return this.http.put<Password>(`${this.apiUrl}/${id}`, password, this.httpOptions);
    }

    // Eliminar contraseña
    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions);
    }
}