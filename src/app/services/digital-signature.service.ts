import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DigitalSignature, CreateDigitalSignatureRequest } from '../models/digital-signature.model';

@Injectable({
  providedIn: 'root'
})
export class DigitalSignatureService {

  private apiUrl = `${environment.url_ms_security}/digital-signatures`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las firmas digitales de un usuario específico
   * @param userId ID del usuario
   * @returns Observable con las firmas digitales del usuario
   */
  getByUserId(userId: number): Observable<DigitalSignature[]> {
    return this.http.get<DigitalSignature[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Obtiene todas las firmas digitales del sistema
   * @returns Observable con todas las firmas digitales
   */
  getAll(): Observable<DigitalSignature[]> {
    return this.http.get<DigitalSignature[]>(`${this.apiUrl}`);
  }

  /**
   * Obtiene una firma digital específica por ID
   * @param id ID de la firma digital
   * @returns Observable con la firma digital
   */
  getById(id: number): Observable<DigitalSignature> {
    return this.http.get<DigitalSignature>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva firma digital para un usuario
   * @param userId ID del usuario
   * @param photo Archivo de imagen de la firma
   * @returns Observable con la firma digital creada
   */
  create(userId: number, photo: File): Observable<DigitalSignature> {
    const formData = new FormData();
    formData.append('photo', photo);
    
    return this.http.post<DigitalSignature>(`${this.apiUrl}/user/${userId}`, formData);
  }

  /**
   * Actualiza una firma digital existente
   * @param id ID de la firma digital
   * @param photo Nuevo archivo de imagen (opcional)
   * @returns Observable con la firma digital actualizada
   */
  update(id: number, photo?: File): Observable<DigitalSignature> {
    const formData = new FormData();
    if (photo) {
      formData.append('photo', photo);
    }
    
    return this.http.put<DigitalSignature>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Elimina una firma digital
   * @param id ID de la firma digital a eliminar
   * @returns Observable con el resultado de la eliminación
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene la URL completa de la imagen de la firma
   * @param photoPath Ruta relativa de la foto
   * @returns URL completa de la imagen
   */
  getPhotoUrl(photoPath: string): string {
    if (!photoPath) return '';
    // Si ya es una URL completa, devolverla tal como está
    if (photoPath.startsWith('http')) {
      return photoPath;
    }
    // Si es una ruta relativa, construir la URL completa
    return `${environment.url_ms_security}/${photoPath}`;
  }

  /**
   * Descarga la imagen de la firma digital
   * @param photoPath Ruta de la imagen
   * @returns Observable con el blob de la imagen
   */
  downloadPhoto(photoPath: string): Observable<Blob> {
    const url = this.getPhotoUrl(photoPath);
    return this.http.get(url, { responseType: 'blob' });
  }
}
