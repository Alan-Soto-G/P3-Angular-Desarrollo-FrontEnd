export interface Answer {
    id?: number;
    content: string;
    security_question_id: number;
    user_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface AnswerCreate {
    content: string;
}

// Interfaz para mostrar en la tabla
export interface AnswerDisplay {
    id: number;
    content: string;
    usuario: string;
    pregunta: string;
    fecha_creacion: string;
    _originalData?: Answer; // Datos originales para operaciones
}