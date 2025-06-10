import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-crud',
  templateUrl: './table-crud.component.html',
  styleUrls: ['./table-crud.component.scss']
})
export class TableCrudComponent implements OnInit {

  // Props que recibe el componente
  @Input() title: string = '';              // Título de la tabla
  @Input() headers: string[] = [];          // Encabezados como array de strings
  @Input() data: any[] = [];                // Datos de las filas
  @Input() buttons: any[] = [];             // Array de botones (para uso futuro)
  @Input() showAddButton: boolean = true;   // Mostrar botón de añadir
  @Input() addButtonText: string = 'Añadir'; // Texto del botón añadir
  @Input() isLoading: boolean = false;      // Estado de carga

  // Eventos que emite - COMBINANDO AMBOS
  @Output() onAdd = new EventEmitter<void>();     // Evento del botón añadir
  @Output() onRowClick = new EventEmitter<any>(); // Evento al hacer click en una fila
  @Output() onButtonClick = new EventEmitter<{ action: string, row: any, index: number }>(); // Evento de botones de acción
  @Output() onEmojiClick = new EventEmitter<{action: string, row: any, index: number}>(); // Evento específico para botones emoji
  @Output() onCreateSession = new EventEmitter<any>(); // Evento para crear sesión

  constructor() { }

  ngOnInit(): void {
    console.log('TableCrud inicializado');
    console.log('Title:', this.title);
    console.log('Headers:', this.headers);
    console.log('Data:', this.data);
    console.log('Buttons:', this.buttons);
  }

  // Método para manejar el click del botón añadir
  handleAddClick() {
    this.onAdd.emit();
  }
// Nuevo método para manejar clic en celda específica
handleCellClick(row: any, rowIndex: number, columnIndex: number, columnName: string): void {
    this.onRowClick.emit({ 
        row, 
        index: rowIndex,
        columnIndex: columnIndex,
        column: columnName,
        columnName: columnName
    });
}

// Mantener el método existente para compatibilidad
handleRowClick(row: any, rowIndex: number): void {
    this.onRowClick.emit({ 
        row, 
        index: rowIndex,
        columnIndex: -1,
        column: 'general',
        columnName: 'general'
    });
}

  // Método para manejar click en botones de acción
  handleButtonClick(action: string, row: any, index: number) {
    this.onButtonClick.emit({ action, row, index });
  }

  // Método para manejar el click del botón crear sesión
  handleCreateSessionClick(row: any, index: number) {
    this.onCreateSession.emit(row);
  }

  /**
   * Maneja el click en botones específicos (emojis)
   */
  handleEmojiButtonClick(action: string, row: any, index: number, event: Event): void {
    event.stopPropagation(); // Evitar que se active el click de la fila
    console.log('Emoji button clicked:', action, row);
    this.onEmojiClick.emit({ action, row, index });
  }

  

  // Método helper para obtener el valor de una propiedad del objeto
  getObjectValues(obj: any): any[] {
    if (!obj) return [];
    return Object.values(obj);
  }

  // Método auxiliar para obtener el nombre de la propiedad de manera genérica
  getPropertyName(header: string): string {
    // Mapeo especial para headers con acentos
    if (header.trim().toLowerCase() === 'método') {
      return 'method';
    }
    // Para otros headers, se transforma a lowercase y se reemplazan espacios por guion bajo
    return header.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Obtiene el valor correspondiente a un header específico
   */
  getValueForHeader(row: any, header: string, index: number): any {
    if (!row) return '';
    
    // Primero intentar acceso directo por nombre del header
    const headerLower = header.toLowerCase();
    const keys = Object.keys(row);
    
    // Buscar clave que coincida con el header
    for (const key of keys) {
      if (key.toLowerCase() === headerLower) {
        return row[key];
      }
    }
    
    // Si no encuentra coincidencia, usar el índice del header
    const values = Object.values(row);
    return values[index] || '';
  }
}