export interface SecurityQuestion {
    id?: number;
    name: string;
    description: string;
    created_at?: string;
    updated_at?: string;
}

export interface SecurityQuestionCreate {
    name: string;
    description: string;
}

// Interfaz para mostrar en la tabla
export interface SecurityQuestionDisplay {
    id: number;
    nombre: string;
    descripcion: string;
    _originalData?: SecurityQuestion; // Datos originales para operaciones
}
