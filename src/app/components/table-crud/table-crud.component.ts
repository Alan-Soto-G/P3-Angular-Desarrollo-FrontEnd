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
  @Output() onButtonClick = new EventEmitter<{ action: string, row: any, index: number }>(); // Evento de botones de acción
  // Dentro de la clase TableCrudComponent
@Output() onCreateSession = new EventEmitter<any>();

// Método para manejar el click del botón crear sesión
handleCreateSessionClick(row: any, index: number) {
  this.onCreateSession.emit(row);
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

  // Método helper para obtener el valor de una propiedad del objeto
  getObjectValues(obj: any): any[] {
    if (!obj) return [];
    return Object.values(obj);
  }

}