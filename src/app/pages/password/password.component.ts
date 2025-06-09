import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaz interna (ya procesada)
interface Password {
  id?: number;
  content: string;
  startAt: Date;
  endAt: Date;
  userId?: number;
  createdAt?: Date;
}

// Interfaz que refleja la respuesta del backend
interface PasswordResponse {
  id: number;
  content: string;
  startAt: string;
  endAt: string;
  user_id: number;
  created_at?: string;
}

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
  form: FormGroup;
  // isNew se usa para determinar si estamos creando (true) o editando (false)
  isNew = false;
  // viewMode: 'list' para listado y 'form' para formulario
  viewMode: 'list' | 'form' = 'list';
  passwords: Password[] = [];
  public userId: number | null = null;
  private baseUrl = 'http://localhost:5000/api/passwords';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [],
      content: ['', Validators.required],
      startAt: ['', Validators.required],
      endAt: ['', Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const userParam = this.route.snapshot.paramMap.get('userId');

    // Modo edición: URL /password/edit/:id
    if (idParam && !isNaN(+idParam)) {
      this.viewMode = 'form';
      this.isNew = false;
      const id = +idParam;
      this.getById(id).subscribe(p => {
        // Asumimos que el backend devuelve las fechas en formato ISO o similar;
        // si no, asegúrate de convertirlas si es necesario.
        this.form.patchValue(p);
      });

    // Modo creación: URL /password/create/:userId
    } else if (userParam && !isNaN(+userParam)) {
      this.viewMode = 'form';
      this.isNew = true;
      this.userId = +userParam;

    // Modo listado: URL /password (sin parámetros)
    } else {
      this.viewMode = 'list';
      this.isNew = false;
      this.loadPasswords();
    }
    console.log('viewMode:', this.viewMode);
  }

  // ------------------- API -------------------

  listAll(): Observable<PasswordResponse[]> {
    return this.http.get<PasswordResponse[]>(`${this.baseUrl}`).pipe(
      catchError(err => {
        console.error('Error al cargar contraseñas:', err);
        return of([]);
      })
    );
  }

  getById(id: number): Observable<Password> {
    return this.http.get<Password>(`${this.baseUrl}/${id}`);
  }

  getByUser(userId: number): Observable<PasswordResponse[]> {
    return this.http.get<PasswordResponse[]>(`${this.baseUrl}/user/${userId}`);
  }

  create(password: Password): Observable<Password> {
    if (this.userId === null) return of(password);
    return this.http.post<Password>(`${this.baseUrl}/user/${this.userId}`, password);
  }

  update(password: Password): Observable<Password> {
    return this.http.put<Password>(`${this.baseUrl}/${password.id}`, password);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // ------------------- Actions -------------------

  loadPasswords(): void {
    this.listAll().subscribe(data => {
      this.passwords = data.map(p => ({
        id: p.id,
        content: p.content,
        startAt: new Date(p.startAt),
        endAt: new Date(p.endAt),
        userId: p.user_id,
        createdAt: p.created_at ? new Date(p.created_at) : undefined
      }));
      console.log('Contraseñas cargadas:', this.passwords);
      // Forzar detección de cambios si es necesario
      this.cdr.detectChanges();
    });
  }

  save(): void {
    const password: Password = this.form.value;

    if (this.isNew) {
      if (this.userId !== null) {
        password.userId = this.userId;
        this.create(password).pipe(
          catchError(err => {
            console.error('Error al crear contraseña:', err);
            alert('No se pudo crear la contraseña.');
            return of(null);
          })
        ).subscribe(res => {
          if (res) this.router.navigate(['/password']);
        });
      } else {
        alert('Falta el userId para crear la contraseña.');
      }
    } else {
      if (password.id != null) {
        this.update(password).subscribe(() => this.router.navigate(['/password']));
      } else {
        alert('Error: no se encontró el ID de la contraseña para actualizar.');
      }
    }
  }

  deletePassword(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta contraseña?')) {
      this.delete(id).subscribe(() => this.loadPasswords());
    }
  }

  editPassword(id: number): void {
    this.router.navigate(['/password', 'edit', id]);
  }
}
