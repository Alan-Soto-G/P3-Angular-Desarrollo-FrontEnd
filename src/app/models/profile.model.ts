export class Profile {
    id?: number;
    phone: string;
    photo: string;
    userId?: number;
    user_id?: number; // 👈 AGREGAR ESTA LÍNEA para coincidir con el backend
    
    // Propiedades opcionales para mostrar información relacionada
    userName?: string;
    userEmail?: string;
    created_at?: string;
    updated_at?: string;

    constructor() {
        this.phone = '';
        this.photo = '';
    }
}