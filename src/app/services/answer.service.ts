import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Answer, AnswerCreate } from '../models/answer.model';

@Injectable({
    providedIn: 'root'
})
export class AnswerService {
    private baseUrl = `${environment.url_ms_security}/answers`;

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient) { }

    // Obtener lista de respuestas (todas)
    list(): Observable<Answer[]> {
        return this.http.get<Answer[]>(this.baseUrl, this.httpOptions);
    }

    // Obtener respuesta por ID
    get(id: number): Observable<Answer> {
        return this.http.get<Answer>(`${this.baseUrl}/${id}`, this.httpOptions);
    }

    // Crear nueva respuesta (user/userId/question/questionId)
    create(userId: number, questionId: number, answer: AnswerCreate): Observable<Answer> {
        const url = `${this.baseUrl}/user/${userId}/question/${questionId}`;
        return this.http.post<Answer>(url, answer, this.httpOptions);
    }

    // Actualizar respuesta
    update(id: number, answer: AnswerCreate): Observable<Answer> {
        return this.http.put<Answer>(`${this.baseUrl}/${id}`, answer, this.httpOptions);
    }

    // Eliminar respuesta
    delete(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`, this.httpOptions);
    }

    // Obtener respuestas por usuario
    getByUser(userId: number): Observable<Answer[]> {
        return this.http.get<Answer[]>(`${this.baseUrl}/user/${userId}`, this.httpOptions);
    }

    // Obtener respuestas por pregunta de seguridad
    getByQuestion(questionId: number): Observable<Answer[]> {
        return this.http.get<Answer[]>(`${this.baseUrl}/question/${questionId}`, this.httpOptions);
    }
}
