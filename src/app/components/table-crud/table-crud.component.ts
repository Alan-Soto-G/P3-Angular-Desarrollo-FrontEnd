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

  // Eventos que emite
  @Output() onAdd = new EventEmitter<void>();     // Evento del botón añadir
  @Output() onRowClick = new EventEmitter<any>(); // Evento al hacer click en una fila
  @Output() onButtonClick = new EventEmitter<{action: string, row: any, index: number}>(); // Evento de botones de acción
  @Output() onEmojiClick = new EventEmitter<{action: string, row: any, index: number}>(); // Evento específico para botones emoji

  constructor() { }

  ngOnInit(): void {
    console.log('TableCrud inicializado');
    console.log('Title:', this.title);
    console.log('Headers:', this.headers);
    console.log('Data:', this.data);
    console.log('Buttons:', this.buttons); // Para uso futuro
  }

  // Método para manejar el click del botón añadir
  handleAddClick() {
    this.onAdd.emit();
  }

  // Método para manejar click en una fila
  handleRowClick(row: any, index: number) {
    this.onRowClick.emit({ row, index });
  }

  // Método para manejar click en botones de acción
  handleButtonClick(action: string, row: any, index: number) {
    this.onButtonClick.emit({ action, row, index });
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
