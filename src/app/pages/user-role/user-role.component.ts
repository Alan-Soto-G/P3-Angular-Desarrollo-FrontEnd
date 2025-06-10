import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.css']
})
export class UserRoleComponent implements OnInit {

  headers: string[] = ['ID', 'Start At', 'End At'];
  data: any[] = [];
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUserRoles();
  }

  fetchUserRoles(): void {
    this.isLoading = true;
    this.http.get<any[]>('/api/user-role/')
      .subscribe({
        next: (response) => {
          this.data = response;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching user-role data', err);
          this.isLoading = false;
        }
      });
  }

  handleRowClick(event: any): void {
    const { row } = event;
    console.log('Fila seleccionada:', row);
    // Aquí puedes abrir un modal o navegar a detalle
  }

  handleAdd(): void {
    console.log('Agregar nueva relación usuario-rol');
    // Aquí podrías abrir un formulario de creación
  }
}
