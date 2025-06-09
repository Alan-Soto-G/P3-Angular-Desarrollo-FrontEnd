import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) { }

    // Obtener todos los usuarios
    list(): Observable<User[]> {
        return this.http.get<User[]>(`${environment.url_ms_security}/users`);
    }

    // Obtener usuario por ID
    view(id: number): Observable<User> {
        return this.http.get<User>(`${environment.url_ms_security}/users/${id}`);
    }

    // Crear usuario
    create(newUser: User): Observable<User> {
        // Remover ID para creación
        const userToCreate = { ...newUser };
        delete userToCreate.id;
        return this.http.post<User>(`${environment.url_ms_security}/users`, userToCreate);
    }

    // Actualizar usuario
    update(id: number, p0: { name: any; email: any; }, theUser: User): Observable<User> {
        return this.http.put<User>(`${environment.url_ms_security}/users/${theUser.id}`, theUser);
    }

    // Eliminar usuario
    delete(id: number): Observable<any> {
        return this.http.delete(`${environment.url_ms_security}/users/${id}`);
    }
}
