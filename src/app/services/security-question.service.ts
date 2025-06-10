import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SecurityQuestion, SecurityQuestionCreate } from '../models/security-question.model';

@Injectable({
    providedIn: 'root'
})
export class SecurityQuestionService {
    private apiUrl = `${environment.url_ms_security}/security-questions`;

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient) { }

    // Obtener lista de preguntas de seguridad
    list(): Observable<SecurityQuestion[]> {
        return this.http.get<SecurityQuestion[]>(this.apiUrl, this.httpOptions);
    }

    // Obtener pregunta de seguridad por ID
    get(id: number): Observable<SecurityQuestion> {
        return this.http.get<SecurityQuestion>(`${this.apiUrl}/${id}`, this.httpOptions);
    }

    // Crear nueva pregunta de seguridad
    create(securityQuestion: SecurityQuestionCreate): Observable<SecurityQuestion> {
        return this.http.post<SecurityQuestion>(this.apiUrl, securityQuestion, this.httpOptions);
    }

    // Actualizar pregunta de seguridad
    update(id: number, securityQuestion: SecurityQuestionCreate): Observable<SecurityQuestion> {
        return this.http.put<SecurityQuestion>(`${this.apiUrl}/${id}`, securityQuestion, this.httpOptions);
    }

    // Eliminar pregunta de seguridad
    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions);
    }
}
