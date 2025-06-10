export interface DigitalSignature {
  id?: number;
  photo?: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

// Interfaz para crear firma digital (solo necesita user_id y la foto se sube)
export interface CreateDigitalSignatureRequest {
  user_id: number;
  photo?: File; // Para el upload de la imagen
}

// Interfaz para mostrar en la tabla
export interface DigitalSignatureDisplay {
  id: number;
  user_id: number;
  user_name?: string; // Nombre del usuario para mostrar en la tabla
  photo: string;
  created_at: string;
  updated_at: string;
}
