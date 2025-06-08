// address.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as L from 'leaflet';

interface Address {
  id?: number;
  street: string;
  number: string;
  userId?: number;
}

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  isNew = false;
  private userId: number | null = null;
  private baseUrl = 'http://localhost:5000/api/addresses';
  private map: L.Map;
  private marker: L.Marker;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) Inicializamos el formulario
    this.form = this.fb.group({
      id: [],
      street: ['', Validators.required],
      number: ['', Validators.required]
    });

    // 2) Leemos parámetros de ruta
    const idParam   = this.route.snapshot.paramMap.get('id');
    const userParam = this.route.snapshot.paramMap.get('userId');

    if (idParam && !isNaN(+idParam)) {
      // Modo edición, cargamos la dirección existente
      this.isNew = false;
      const id = +idParam;
      this.getById(id).subscribe(addr => this.form.patchValue(addr));
    }
    else if (userParam && !isNaN(+userParam)) {
      // Modo creación, asociada a userId
      this.isNew = true;
      this.userId = +userParam;
    }
    else {
      // Ni id ni userId: mostramos formulario vacío en creación genérica
      this.isNew = true;
    }
  }

  ngAfterViewInit(): void {
    if (this.map) return;

    setTimeout(() => {
      this.map = L.map('map').setView([6.2442, -75.5812], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.marker = L.marker([6.2442, -75.5812], { draggable: true }).addTo(this.map)
        .bindPopup('Ubicación inicial').openPopup();

      this.marker.on('dragend', () => {
        const pos = this.marker.getLatLng();
        console.log('Nueva posición:', pos.lat, pos.lng);
      });

      setTimeout(() => this.map.invalidateSize(), 100);
    }, 300);
  }

  listAll(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.baseUrl}/${id}`);
  }

  getByUser(userId: number): Observable<Address> {
    return this.http.get<Address>(`${this.baseUrl}/user/${userId}`);
  }

  create(addr: Address): Observable<Address> {
    if (this.userId === null) {
      return of(addr); // o lanzar error
    }
    return this.http.post<Address>(`${this.baseUrl}/user/${this.userId}`, addr);
  }

  update(addr: Address): Observable<Address> {
    return this.http.put<Address>(`${this.baseUrl}/${addr.id}`, addr);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  save(): void {
    const addr: Address = this.form.value;

    if (this.isNew) {
      // Crear o actualizar según exista ya una dirección para el user
      if (this.userId !== null) {
        this.getByUser(this.userId).pipe(
          switchMap(existing => {
            if (existing && existing.id) {
              // Ya existe: actualizamos
              addr.id = existing.id;
              return this.update(addr);
            } else {
              // No existe: creamos
              return this.create(addr);
            }
          }),
          catchError(() => {
            // Si falla el GET (404), creamos
            return this.create(addr);
          })
        ).subscribe(() => this.router.navigate(['/address']));
      } else {
        // Caso genérico sin userId: creamos sin userId
        this.create(addr).subscribe(() => this.router.navigate(['/address']));
      }
    }
    else {
      // Edición pura de dirección existente
      const id = addr.id;
      if (id != null) {
        this.update(addr).subscribe(() => this.router.navigate(['/address']));
      } else {
        alert('Error: no se encontró el ID de la dirección para actualizar.');
      }
    }
  }

  deleteAddress(): void {
    const id = this.form.value.id;
    if (id != null && confirm('¿Estás seguro de eliminar esta dirección?')) {
      this.delete(id).subscribe(() => this.router.navigate(['/address']));
    }
  }
}
