import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/profile.model';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    constructor(private http: HttpClient) { }

    // Obtener todos los perfiles - QUITANDO /api/ duplicado
    list(): Observable<Profile[]> {
        return this.http.get<Profile[]>(`${environment.url_ms_security}/profiles/`);
    }

    // Obtener perfil por ID
    view(id: number): Observable<Profile> {
        return this.http.get<Profile>(`${environment.url_ms_security}/profiles/${id}`);
    }

    // Obtener perfil por userId
    getByUserId(userId: number): Observable<Profile> {
        return this.http.get<Profile>(`${environment.url_ms_security}/profiles/user/${userId}`);
    }

    // En el método create, cambiar la estructura del objeto:
    create(newProfile: Profile): Observable<Profile> {
        const formData = new FormData();
        formData.append('phone', newProfile.phone || '');

        // Si hay foto, agregarla al FormData
        if (newProfile.photo) {
            if (newProfile.photo.startsWith('data:')) {
                const blob = this.dataURLtoBlob(newProfile.photo);
                formData.append('photo', blob, 'profile.jpg');
            }
        }

        // Usar la ruta correcta del backend
        const userId = newProfile.userId || newProfile.user_id;
        return this.http.post<Profile>(
            `${environment.url_ms_security}/profiles/user/${userId}`,
            formData
        );
    }

    // Actualizar perfil
    update(id: number, theProfile: Profile): Observable<Profile> {
        const formData = new FormData();
        formData.append('phone', theProfile.phone || '');

        if (theProfile.photo) {
            if (theProfile.photo.startsWith('data:')) {
                const blob = this.dataURLtoBlob(theProfile.photo);
                formData.append('photo', blob, 'profile.jpg');
            }
        }

        return this.http.put<Profile>(`${environment.url_ms_security}/profiles/${id}`, formData);
    }

    // Eliminar perfil
    delete(id: number): Observable<any> {
        return this.http.delete(`${environment.url_ms_security}/profiles/${id}`);
    }

    // Método auxiliar para convertir base64 a blob
    private dataURLtoBlob(dataURL: string): Blob {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }
}