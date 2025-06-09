import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../models/session.model';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    constructor(private http: HttpClient) { }

    // Obtener todas las sesiones
    list(): Observable<Session[]> {
        return this.http.get<Session[]>(`${environment.url_ms_security}/sessions/`);
    }

    // Obtener sesión por ID
    view(id: string): Observable<Session> {
        return this.http.get<Session>(`${environment.url_ms_security}/sessions/${id}`);
    }

    // Crear sesión
    create(newSession: Session, userId: number): Observable<Session> {
        const sessionToCreate = { ...newSession };
        delete sessionToCreate.id;
        return this.http.post<Session>(
            `${environment.url_ms_security}/sessions/user/${userId}`,
            sessionToCreate
        );
    }

    // Actualizar sesión (sin la barra final)
    update(theSession: Session): Observable<Session> {
        return this.http.put<Session>(`${environment.url_ms_security}/sessions/${theSession.id}`, theSession);
    }

    // Eliminar sesión (sin la barra final)
    delete(id: string): Observable<any> {
        return this.http.delete(`${environment.url_ms_security}/sessions/${id}`);
    }
}